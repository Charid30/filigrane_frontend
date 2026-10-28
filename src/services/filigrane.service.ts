import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface FiligraneConfig {
  file: File | null;
  texte: string;
  taille: number;
  opacite: number;
  position: 'centre' | 'diagonal';
}

@Injectable({ providedIn: 'root' })
export class FiligraneService {
  private readonly API_URL = environment.apiUrl;

  private _config = signal<FiligraneConfig>({
    file: null,
    texte: '',
    taille: 28,
    opacite: 40,
    position: 'diagonal',
  });

  private _resultBlob = signal<Blob | null>(null);
  private _resultFileName = signal<string>('document-filigrane.pdf');

  readonly config = this._config.asReadonly();
  readonly resultFileName = this._resultFileName.asReadonly();

  constructor(private http: HttpClient) {}

  setConfig(config: Partial<FiligraneConfig>) {
    this._config.update(c => ({ ...c, ...config }));
  }

  appliquerFiligrane(): Observable<Blob> {
    const config = this._config();
    const formData = new FormData();
    formData.append('document', config.file!);
    formData.append('texte', config.texte);
    formData.append('taille', config.taille.toString());
    formData.append('opacite', config.opacite.toString());
    formData.append('position', config.position);
    return this.http.post(`${this.API_URL}/filigrane`, formData, { responseType: 'blob' });
  }

  /** Avec responseType 'blob', le corps JSON des erreurs arrive aussi en Blob : on le lit pour afficher le message du serveur. */
  async lireErreur(err: any): Promise<string> {
    const defaut = 'Une erreur est survenue lors du traitement. Veuillez réessayer.';
    // Statut 0 : la requête n'a jamais atteint le serveur (hors ligne, ou bloquée par une extension du navigateur)
    if (err?.status === 0) {
      return navigator.onLine
        ? 'La requête a été bloquée par votre navigateur. Désactivez votre bloqueur de publicités (ou la protection contre le suivi) pour ce site, ou réessayez en navigation privée.'
        : 'Vous semblez hors ligne. Vérifiez votre connexion internet puis réessayez.';
    }
    if (err?.error instanceof Blob) {
      try { return JSON.parse(await err.error.text())?.erreur || defaut; } catch { return defaut; }
    }
    return err?.error?.erreur || defaut;
  }

  setResult(blob: Blob, fileName: string) {
    this._resultBlob.set(blob);
    this._resultFileName.set(fileName);
  }

  getResultUrl(): string | null {
    const blob = this._resultBlob();
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }

  reset() {
    this._config.set({ file: null, texte: '', taille: 28, opacite: 40, position: 'diagonal' });
    this._resultBlob.set(null);
    this._resultFileName.set('document-filigrane.pdf');
  }
}
