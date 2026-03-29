import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FiligraneService } from '../../services/filigrane.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './accueil.html',
  styleUrl: './accueil.scss',
})
export class Accueil {
  texteFiligrane = '';
  fichierSelectionne: File | null = null;
  isDragOver = signal(false);
  erreur = signal<string | null>(null);

  readonly FORMATS_ACCEPTES = ['application/pdf', 'image/jpeg', 'image/png'];
  readonly TAILLE_MAX = 10 * 1024 * 1024;

  readonly textesPredefinis = [
    'Destiné exclusivement au dossier de location',
    'Document fourni — usage unique',
    'Copie non valable — Original à fournir sur demande',
    'Document réservé à l\'usage administratif',
    'Dossier de candidature',
    'Usage bancaire uniquement',
    'Document fourni dans le cadre d\'une demande de visa',
  ];

  constructor(
    private router: Router,
    private filigraneService: FiligraneService,
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave() {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.traiterFichier(files[0]);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.traiterFichier(input.files[0]);
  }

  traiterFichier(fichier: File) {
    this.erreur.set(null);
    if (!this.FORMATS_ACCEPTES.includes(fichier.type)) {
      this.erreur.set('Format non supporté. Utilisez un fichier PDF, JPG ou PNG.');
      return;
    }
    if (fichier.size > this.TAILLE_MAX) {
      this.erreur.set('Le fichier dépasse la taille maximale de 10 Mo.');
      return;
    }
    this.fichierSelectionne = fichier;
  }

  selectionnerTexte(texte: string) {
    this.texteFiligrane = texte;
  }

  supprimerFichier() {
    this.fichierSelectionne = null;
    this.erreur.set(null);
  }

  soumettre() {
    if (!this.fichierSelectionne) {
      this.erreur.set('Veuillez sélectionner un document.');
      return;
    }
    if (!this.texteFiligrane.trim()) {
      this.erreur.set('Veuillez saisir un texte de filigrane.');
      return;
    }
    this.filigraneService.setConfig({
      file: this.fichierSelectionne,
      texte: this.texteFiligrane.trim(),
    });
    this.router.navigate(['/traitement']);
  }

  get nomFichier(): string {
    return this.fichierSelectionne?.name ?? '';
  }

  get tailleFichier(): string {
    if (!this.fichierSelectionne) return '';
    const size = this.fichierSelectionne.size;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  get peutSoumettre(): boolean {
    return !!this.fichierSelectionne && !!this.texteFiligrane.trim();
  }
}
