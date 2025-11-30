import jsPDF from "jspdf";
import { FactureProps } from "@/lib/type";

export const generateFacturePDF = (
  facture: FactureProps,
  salonName: string = "InkStudio"
) => {
  const pdf = new jsPDF();

  // Configuration
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Couleurs
  const darkColor = "#1F2937";
  const grayColor = "#6B7280";

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // En-tête de la facture
  pdf.setFillColor(31, 41, 55); // noir (darkColor)
  pdf.rect(0, 0, pageWidth, 40, "F");

  // Titre
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("FACTURE", margin, 25);

  // Numéro de facture
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`N° ${facture.id.slice(-8)}`, pageWidth - margin - 40, 25);

  yPos = 60;

  // Informations du salon (à gauche)
  pdf.setTextColor(darkColor);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(salonName, margin, yPos);

  yPos += 10;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Salon de tatouage professionnel", margin, yPos);

  // Informations client (à droite)
  const clientX = pageWidth - margin - 80;
  let clientY = 60;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("FACTURÉ À:", clientX, clientY);

  clientY += 15;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `${facture.client.firstName} ${facture.client.lastName}`,
    clientX,
    clientY
  );

  if (facture.client.email) {
    clientY += 8;
    pdf.text(facture.client.email, clientX, clientY);
  }

  if (facture.client.phone) {
    clientY += 8;
    pdf.text(facture.client.phone, clientX, clientY);
  }

  yPos = Math.max(yPos + 40, clientY + 20);

  // Ligne de séparation
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 20;

  // Informations de la facture
  const infoY = yPos;

  // Date RDV
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Date RDV:", margin, infoY);
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(facture.dateRdv), margin + 25, infoY);

  // Tatoueur
  pdf.setFont("helvetica", "bold");
  pdf.text("Tatoueur:", margin, infoY + 10);
  pdf.setFont("helvetica", "normal");
  pdf.text(facture.tatoueur, margin + 25, infoY + 10);

  // Statut de paiement (à droite)
  const statusX = pageWidth - margin - 60;
  pdf.setFont("helvetica", "bold");
  pdf.text("Statut:", statusX, infoY);
  pdf.setFont("helvetica", "normal");

  if (facture.isPayed) {
    pdf.setTextColor(34, 197, 94); // vert
    pdf.text("PAYÉ", statusX + 20, infoY);
  } else {
    pdf.setTextColor(251, 146, 60); // orange
    pdf.text("EN ATTENTE", statusX + 20, infoY);
  }

  pdf.setTextColor(darkColor);

  yPos += 40;

  // Tableau des prestations
  // En-tête du tableau
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 15, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("PRESTATION", margin + 5, yPos + 10);
  pdf.text("DÉTAILS", margin + 60, yPos + 10);
  pdf.text("MONTANT", pageWidth - margin - 30, yPos + 10);

  yPos += 15;

  // Ligne de prestation
  pdf.setFont("helvetica", "normal");
  pdf.text(facture.prestation, margin + 5, yPos + 10);

  // Détails de la prestation
  const details: string[] = [];
  if (facture.prestationDetails) {
    if (facture.prestationDetails.size)
      details.push(`Taille: ${facture.prestationDetails.size}`);
    if (facture.prestationDetails.zone)
      details.push(`Zone: ${facture.prestationDetails.zone}`);
    if (facture.prestationDetails.colorStyle)
      details.push(`Style: ${facture.prestationDetails.colorStyle}`);

    // Pour les piercings
    if (
      facture.prestation === "PIERCING" &&
      facture.prestationDetails.piercingDetails
    ) {
      const piercingZone =
        facture.prestationDetails.piercingDetails.zoneBouche ||
        facture.prestationDetails.piercingDetails.zoneCorps ||
        facture.prestationDetails.piercingDetails.zoneMicrodermal ||
        facture.prestationDetails.piercingDetails.zoneOreille ||
        facture.prestationDetails.piercingDetails.zoneVisage;
      if (piercingZone) details.push(`Zone détaillée: ${piercingZone}`);
    }
  }

  // Affichage des détails (max 3 lignes)
  details.slice(0, 3).forEach((detail, index) => {
    pdf.setFontSize(8);
    pdf.setTextColor(grayColor);
    pdf.text(detail, margin + 60, yPos + 8 + index * 6);
  });

  // Prix
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(darkColor);
  pdf.text(formatPrice(facture.price), pageWidth - margin - 30, yPos + 10);

  yPos += 25;

  // Description si disponible
  if (facture.prestationDetails?.description) {
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Description:", margin, yPos);

    yPos += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    // Découper la description en lignes
    const descriptionLines = pdf.splitTextToSize(
      facture.prestationDetails.description,
      pageWidth - 2 * margin
    );
    descriptionLines.slice(0, 4).forEach((line: string, index: number) => {
      pdf.text(line, margin, yPos + index * 6);
    });

    yPos += descriptionLines.length * 6 + 10;
  }

  // Ligne de séparation avant total
  yPos += 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPos, pageWidth - margin, yPos);

  // Total
  yPos += 20;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("TOTAL:", pageWidth - margin - 60, yPos);
  pdf.setFontSize(16);
  pdf.setTextColor(darkColor);
  pdf.text(formatPrice(facture.price), pageWidth - margin - 30, yPos);

  // Pied de page
  const footerY = pageHeight - 30;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  pdf.setFontSize(8);
  pdf.setTextColor(grayColor);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Merci de votre confiance - ${salonName}`, margin, footerY);
  pdf.text(
    `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
    pageWidth - margin - 40,
    footerY
  );

  // Télécharger le PDF
  const fileName = `Facture_${facture.id.slice(-8)}_${
    facture.client.firstName
  }_${facture.client.lastName}.pdf`;
  pdf.save(fileName);
};
