import jsPDF from 'jspdf';
import { Chart, registerables } from 'chart.js';
import { ExportOptions, MedicalExportData } from './types';

Chart.register(...registerables);

export class PDFGenerator {
  private doc!: jsPDF;
  private pageHeight: number = 297; // A4
  private pageWidth: number = 210;
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 6;

  async generate(data: MedicalExportData, options: ExportOptions): Promise<Blob> {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.currentY = this.margin;

    // Configuration des polices
    this.doc.setFont('helvetica');
    
    // Page 1: En-tête et résumé exécutif
    await this.generateHeader(data);
    this.generateExecutiveSummary(data);
    
    // Page 2+: Sections détaillées
    if (options.sections.find(s => s.id === 'profile' && s.enabled)) {
      this.addNewPageIfNeeded();
      this.generateProfileSection(data);
    }

    if (options.sections.find(s => s.id === 'mood' && s.enabled)) {
      this.addNewPageIfNeeded();
      await this.generateMoodSection(data, options.includeGraphs);
    }

    if (options.sections.find(s => s.id === 'habits' && s.enabled)) {
      this.addNewPageIfNeeded();
      await this.generateHabitsSection(data, options.includeGraphs);
    }

    if (options.sections.find(s => s.id === 'observations' && s.enabled) && options.includeNotes) {
      this.addNewPageIfNeeded();
      this.generateObservationsSection(data);
    }

    // Footer sur toutes les pages
    this.addFooters(data);

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  private async generateHeader(data: MedicalExportData): Promise<void> {
    // En-tête professionnel
    this.doc.setFontSize(20);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('RAPPORT ADHD - SUIVI MÉDICAL', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setTextColor(127, 140, 141);
    this.doc.text(`Période: ${data.metadata.period.start} au ${data.metadata.period.end}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    // Ligne de séparation
    this.currentY += 8;
    this.doc.setDrawColor(189, 195, 199);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 12;
  }

  private generateExecutiveSummary(data: MedicalExportData): void {
    this.addSection('RÉSUMÉ EXÉCUTIF', 16, () => {
      // Informations patient
      this.addSubSection('Patient', 12, () => {
        this.addText(`Nom: ${data.metadata.patient.name}`);
        if (data.metadata.patient.age) {
          this.addText(`Âge: ${data.metadata.patient.age} ans`);
        }
        this.addText(`Période d'observation: ${data.metadata.period.days} jours`);
        if (data.metadata.patient.anonymized) {
          this.addText('⚠️ Données anonymisées', 10, [231, 76, 60]);
        }
      });

      // Médicaments actuels
      if (data.profile.medications.length > 0) {
        this.addSubSection('Médicaments actuels', 12, () => {
          data.profile.medications.forEach(med => {
            const adherence = med.adherence ? ` (Adhérence: ${Math.round(med.adherence * 100)}%)` : '';
            this.addText(`• ${med.name} - ${med.dosage} - ${med.frequency}${adherence}`);
          });
        });
      }

      // Tendances générales
      this.addSubSection('Tendances générales', 12, () => {
        const trends = data.mood.trends;
        this.addText(`Humeur: ${this.getTrendIcon(trends.mood)} ${this.getTrendText(trends.mood)}`);
        this.addText(`Énergie: ${this.getTrendIcon(trends.energy)} ${this.getTrendText(trends.energy)}`);
        this.addText(`Concentration: ${this.getTrendIcon(trends.focus)} ${this.getTrendText(trends.focus)}`);
        this.addText(`Anxiété: ${this.getTrendIcon(trends.anxiety, true)} ${this.getTrendText(trends.anxiety, true)}`);
      });
    });
  }

  private generateProfileSection(data: MedicalExportData): void {
    this.addSection('PROFIL PATIENT', 16, () => {
      // Défis ADHD
      if (data.profile.challenges.length > 0) {
        this.addSubSection('Défis ADHD identifiés', 12, () => {
          data.profile.challenges.forEach(challenge => {
            this.addText(`• ${challenge}`);
          });
        });
      }

      // Chronotype
      this.addSubSection('Chronotype', 12, () => {
        this.addText(`Type: ${data.profile.chronotype}`);
      });

      // Détail des médicaments
      if (data.profile.medications.length > 0) {
        this.addSubSection('Détail des médicaments', 12, () => {
          data.profile.medications.forEach(med => {
            this.addText(`${med.name}`, 11, [52, 73, 94], 'bold');
            this.addText(`  Dosage: ${med.dosage}`);
            this.addText(`  Fréquence: ${med.frequency}`);
            if (med.adherence) {
              const adherencePercent = Math.round(med.adherence * 100);
              const color = adherencePercent >= 80 ? [46, 125, 50] : adherencePercent >= 60 ? [255, 152, 0] : [244, 67, 54];
              this.addText(`  Adhérence: ${adherencePercent}%`, 10, color);
            }
            if (med.notes) {
              this.addText(`  Notes: ${med.notes}`, 10, [127, 140, 141]);
            }
            this.currentY += 3;
          });
        });
      }
    });
  }

  private async generateMoodSection(data: MedicalExportData, includeGraphs: boolean): Promise<void> {
    this.addSection('HUMEUR ET ÉMOTIONS', 16, () => {
      // Moyennes
      this.addSubSection('Moyennes sur la période', 12, () => {
        this.addText(`Humeur moyenne: ${data.mood.averages.mood}/10`);
        this.addText(`Énergie moyenne: ${data.mood.averages.energy}/10`);
        this.addText(`Concentration moyenne: ${data.mood.averages.focus}/10`);
        this.addText(`Anxiété moyenne: ${data.mood.averages.anxiety}/10`);
      });

      // Nombre d'entrées
      this.addSubSection('Statistiques', 12, () => {
        this.addText(`Nombre d'entrées: ${data.mood.entries.length}`);
        if (data.mood.entries.length > 0) {
          const frequency = (data.mood.entries.length / data.metadata.period.days * 100).toFixed(1);
          this.addText(`Fréquence de saisie: ${frequency}%`);
        }
      });
    });

    // Graphique si demandé
    if (includeGraphs && data.mood.entries.length > 0) {
      await this.addMoodChart(data.mood.entries);
    }
  }

  private async generateHabitsSection(data: MedicalExportData, includeGraphs: boolean): Promise<void> {
    this.addSection('HABITUDES ET ROUTINES', 16, () => {
      // Sommeil
      if (data.habits.sleep.length > 0) {
        this.addSubSection('Sommeil', 12, () => {
          const avgDuration = data.habits.sleep.reduce((acc, sleep) => acc + sleep.duration, 0) / data.habits.sleep.length;
          const avgQuality = data.habits.sleep.reduce((acc, sleep) => acc + sleep.quality, 0) / data.habits.sleep.length;
          
          this.addText(`Durée moyenne: ${avgDuration.toFixed(1)}h`);
          this.addText(`Qualité moyenne: ${avgQuality.toFixed(1)}/10`);
          this.addText(`Nombre de nuits enregistrées: ${data.habits.sleep.length}`);
        });
      }

      // Exercice
      if (data.habits.exercise.length > 0) {
        this.addSubSection('Activité physique', 12, () => {
          const totalSessions = data.habits.exercise.length;
          const avgDuration = data.habits.exercise.reduce((acc, ex) => acc + ex.duration, 0) / totalSessions;
          const avgIntensity = data.habits.exercise.reduce((acc, ex) => acc + ex.intensity, 0) / totalSessions;
          
          this.addText(`Sessions d'exercice: ${totalSessions}`);
          this.addText(`Durée moyenne: ${avgDuration.toFixed(0)} minutes`);
          this.addText(`Intensité moyenne: ${avgIntensity.toFixed(1)}/10`);
        });
      }

      // Adhérence médicaments
      if (data.habits.medication.length > 0) {
        this.addSubSection('Prise de médicaments', 12, () => {
          const takenCount = data.habits.medication.filter(med => med.taken).length;
          const totalCount = data.habits.medication.length;
          const adherencePercent = (takenCount / totalCount * 100).toFixed(1);
          
          this.addText(`Prises effectuées: ${takenCount}/${totalCount}`);
          this.addText(`Adhérence globale: ${adherencePercent}%`);
        });
      }
    });

    // Graphiques si demandé
    if (includeGraphs) {
      if (data.habits.sleep.length > 0) {
        await this.addSleepChart(data.habits.sleep);
      }
    }
  }

  private generateObservationsSection(data: MedicalExportData): void {
    this.addSection('OBSERVATIONS PERSONNELLES', 16, () => {
      // Notes utilisateur récentes
      if (data.observations.userNotes.length > 0) {
        this.addSubSection('Notes récentes', 12, () => {
          // Prendre les 10 notes les plus récentes
          const recentNotes = data.observations.userNotes
            .slice(0, 10)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          recentNotes.forEach(note => {
            this.addText(`${note.date} - ${note.category}:`, 10, [52, 73, 94], 'bold');
            this.addText(`"${note.note}"`, 10, [127, 140, 141]);
            this.currentY += 2;
          });
        });
      }

      // Patterns identifiés
      if (data.observations.patterns.length > 0) {
        this.addSubSection('Patterns identifiés', 12, () => {
          data.observations.patterns.forEach(pattern => {
            const impactColor = pattern.impact === 'positive' ? [46, 125, 50] : 
                              pattern.impact === 'negative' ? [244, 67, 54] : [127, 140, 141];
            const impactIcon = pattern.impact === 'positive' ? '✓' : 
                             pattern.impact === 'negative' ? '✗' : '•';
            
            this.addText(`${impactIcon} ${pattern.pattern}`, 10, impactColor);
            this.addText(`  Fréquence: ${(pattern.frequency * 100).toFixed(0)}%`, 9, [127, 140, 141]);
          });
        });
      }
    });
  }

  private async addMoodChart(moodEntries: any[]): Promise<void> {
    if (moodEntries.length === 0) return;

    this.checkSpace(80);
    
    // Créer un canvas temporaire pour le graphique
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Préparer les données pour le graphique
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = sortedEntries.map(entry => new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Humeur',
            data: sortedEntries.map(e => e.mood),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          },
          {
            label: 'Énergie',
            data: sortedEntries.map(e => e.energy),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
          },
          {
            label: 'Concentration',
            data: sortedEntries.map(e => e.focus),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: false,
        animation: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Score (1-10)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Évolution de l\'humeur, énergie et concentration',
            font: { size: 16 }
          },
          legend: {
            display: true
          }
        }
      }
    });

    // Attendre que le graphique soit rendu
    await new Promise(resolve => {
      chart.update('none');
      setTimeout(resolve, 100);
    });

    // Convertir le canvas en image et l'ajouter au PDF
    const imageData = canvas.toDataURL('image/png');
    const imgWidth = 170;
    const imgHeight = 85;
    
    this.doc.addImage(imageData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
    this.currentY += imgHeight + 10;

    // Nettoyer
    chart.destroy();
    canvas.remove();
  }

  private async addSleepChart(sleepData: any[]): Promise<void> {
    if (sleepData.length === 0) return;

    this.checkSpace(80);
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sortedData = [...sleepData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = sortedData.map(entry => new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Durée (heures)',
            data: sortedData.map(e => e.duration),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Qualité (1-10)',
            data: sortedData.map(e => e.quality),
            type: 'line',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: false,
        animation: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Durée (heures)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            max: 10,
            title: {
              display: true,
              text: 'Qualité (1-10)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Durée et qualité du sommeil',
            font: { size: 16 }
          }
        }
      }
    });

    await new Promise(resolve => {
      chart.update('none');
      setTimeout(resolve, 100);
    });

    const imageData = canvas.toDataURL('image/png');
    this.doc.addImage(imageData, 'PNG', this.margin, this.currentY, 170, 85);
    this.currentY += 95;

    chart.destroy();
    canvas.remove();
  }

  private addSection(title: string, fontSize: number, content: () => void): void {
    this.checkSpace(20);
    
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(44, 62, 80);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    content();
    this.currentY += 5;
  }

  private addSubSection(title: string, fontSize: number, content: () => void): void {
    this.checkSpace(15);
    
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(52, 73, 94);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 6;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    content();
    this.currentY += 3;
  }

  private addText(text: string, fontSize: number = 10, color: number[] = [0, 0, 0], weight: 'normal' | 'bold' = 'normal'): void {
    this.checkSpace(this.lineHeight);
    
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color[0], color[1], color[2]);
    this.doc.setFont('helvetica', weight);
    
    // Gérer le texte long avec retour à la ligne
    const maxWidth = this.pageWidth - 2 * this.margin;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      this.checkSpace(this.lineHeight);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private checkSpace(neededSpace: number): void {
    if (this.currentY + neededSpace > this.pageHeight - this.margin - 15) { // Laisser de l'espace pour le footer
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addNewPageIfNeeded(): void {
    if (this.currentY > this.margin + 20) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addFooters(data: MedicalExportData): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer
      this.doc.setFontSize(8);
      this.doc.setTextColor(127, 140, 141);
      
      const footerY = this.pageHeight - 10;
      
      // Gauche: Date de génération
      this.doc.text(`Généré le ${new Date(data.metadata.generatedAt).toLocaleDateString('fr-FR')}`, this.margin, footerY);
      
      // Centre: Disclaimer
      this.doc.text('Document patient - Confidentiel médical', this.pageWidth / 2, footerY, { align: 'center' });
      
      // Droite: Numéro de page
      this.doc.text(`${i}/${pageCount}`, this.pageWidth - this.margin, footerY, { align: 'right' });
    }
  }

  private getTrendIcon(trend: string, inverse: boolean = false): string {
    if (inverse) {
      switch (trend) {
        case 'improving': return '↓'; // Pour anxiété, une baisse est bien
        case 'declining': return '↑';
        default: return '→';
      }
    }
    
    switch (trend) {
      case 'improving': return '↑';
      case 'declining': return '↓';
      default: return '→';
    }
  }

  private getTrendText(trend: string, inverse: boolean = false): string {
    if (inverse) {
      switch (trend) {
        case 'improving': return 'en diminution';
        case 'declining': return 'en augmentation';
        default: return 'stable';
      }
    }
    
    switch (trend) {
      case 'improving': return 'en amélioration';
      case 'declining': return 'en baisse';
      default: return 'stable';
    }
  }
}