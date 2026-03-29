import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FiligraneService } from '../../services/filigrane.service';

@Component({
  selector: 'app-traitement',
  standalone: true,
  imports: [],
  templateUrl: './traitement.html',
  styleUrl: './traitement.scss',
})
export class Traitement implements OnInit {
  progression = signal(0);
  etape = signal('Préparation du document...');
  erreur = signal<string | null>(null);

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private router: Router,
    private filigraneService: FiligraneService,
  ) {}

  ngOnInit() {
    if (!this.filigraneService.config().file) {
      this.router.navigate(['/']);
      return;
    }
    this.lancerTraitement();
  }

  lancerTraitement() {
    const etapes = [
      { delai: 300,  progression: 15, msg: 'Lecture du document...' },
      { delai: 800,  progression: 40, msg: 'Application du filigrane...' },
      { delai: 1500, progression: 70, msg: 'Finalisation du PDF...' },
      { delai: 2200, progression: 85, msg: 'Préparation du téléchargement...' },
    ];

    etapes.forEach(({ delai, progression, msg }) => {
      const t = setTimeout(() => {
        this.progression.set(progression);
        this.etape.set(msg);
      }, delai);
      this.timers.push(t);
    });

    this.filigraneService.appliquerFiligrane().subscribe({
      next: (blob) => {
        this.timers.forEach(clearTimeout);
        const nomOriginal = this.filigraneService.config().file?.name ?? 'document';
        const nomSansExt = nomOriginal.replace(/\.[^/.]+$/, '');
        const fileName = `${nomSansExt}-filigrane.pdf`;
        this.filigraneService.setResult(blob, fileName);
        this.progression.set(100);
        this.etape.set('Terminé !');
        setTimeout(() => this.router.navigate(['/resultat']), 500);
      },
      error: () => {
        this.timers.forEach(clearTimeout);
        this.erreur.set('Une erreur est survenue lors du traitement. Veuillez réessayer.');
      },
    });
  }

  retourAccueil() {
    this.timers.forEach(clearTimeout);
    this.filigraneService.reset();
    this.router.navigate(['/']);
  }
}
