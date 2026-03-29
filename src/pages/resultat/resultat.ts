import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FiligraneService } from '../../services/filigrane.service';

@Component({
  selector: 'app-resultat',
  standalone: true,
  imports: [],
  templateUrl: './resultat.html',
  styleUrl: './resultat.scss',
})
export class Resultat implements OnInit, OnDestroy {
  downloadUrl = signal<string | null>(null);
  fileName = signal<string>('document-filigrane.pdf');
  telechargementEffectue = signal(false);

  constructor(
    private router: Router,
    private filigraneService: FiligraneService,
  ) {}

  ngOnInit() {
    const url = this.filigraneService.getResultUrl();
    if (!url) {
      this.router.navigate(['/']);
      return;
    }
    this.downloadUrl.set(url);
    this.fileName.set(this.filigraneService.resultFileName());
  }

  ngOnDestroy() {
    const url = this.downloadUrl();
    if (url) URL.revokeObjectURL(url);
  }

  telecharger() {
    const url = this.downloadUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName();
    a.click();
    this.telechargementEffectue.set(true);
  }

  nouveauDocument() {
    this.filigraneService.reset();
    this.router.navigate(['/']);
  }
}
