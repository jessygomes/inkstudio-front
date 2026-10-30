import LegalPage from "@/components/Legal/LegalPage";
import s from "@/components/Legal/LegalPage.module.css";
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { FaBuilding, FaGavel, FaServer, FaShieldAlt } from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description:
    "Consultez les mentions légales d'Inkera Studio, plateforme de gestion pour salons de tatouage. Informations légales, conditions d'utilisation et données de l'entreprise.",
  keywords: [
    "mentions légales",
    "Inkera Studio",
    "informations légales",
    "conditions utilisation",
    "RGPD",
  ],
};

export default function MentionsLegales() {
  return <LegalPage kind="notices" title="Mentions" accent="légales." description="Les informations sur l’éditeur, l’hébergement et les responsabilités liées à INKERA Studio." sections={[{"id":"article-01","title":"Identité de l'entreprise"},{"id":"article-02","title":"Direction et responsabilité"},{"id":"article-03","title":"Hébergement et infrastructure"},{"id":"article-04","title":"Propriété intellectuelle"},{"id":"article-05","title":"Limitation de responsabilité"},{"id":"article-06","title":"Protection des données personnelles"},{"id":"article-07","title":"Droit applicable et juridiction"}]}>

              {/* Identité de l'entreprise */}
              <section id="article-01" className={s.articleSection}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaBuilding size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className={s.articleTitle}>
                    Identité de l&apos;entreprise
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Dénomination sociale
                      </h3>
                      <p>Inkera Studio</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Forme juridique
                      </h3>
                      <p>Société par Actions Simplifiée (SAS)</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Capital social
                      </h3>
                      <p>50 000 €</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">RCS</h3>
                      <p>Paris B 123 456 789</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">SIRET</h3>
                      <p>123 456 789 00012</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        TVA Intracommunautaire
                      </h3>
                      <p>FR12 123456789</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-white mb-2">
                      Siège social
                    </h3>
                    <p>
                      123 Rue de l&apos;Innovation
                      <br />
                      75001 Paris, France
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-white mb-2">Contact</h3>
                    <p>
                      Email : contact@inkera-studio.com
                      <br />
                      {/* Téléphone : +33 1 23 45 67 89 */}
                    </p>
                  </div>
                </div>
              </section>

              {/* Directeur de publication */}
              <section id="article-02" className={s.articleSection}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaShieldAlt size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className={s.articleTitle}>
                    Direction et responsabilité
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Directeur de la publication
                    </h3>
                    <p>Jessy Gomes, Fondateur de Inkera Studio</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Responsable de la rédaction
                    </h3>
                    <p>Équipe Inkera Studio</p>
                  </div>
                </div>
              </section>

              {/* Hébergement */}
              <section id="article-03" className={s.articleSection}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaServer size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className={s.articleTitle}>
                    Hébergement et infrastructure
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Hébergeur principal
                    </h3>
                    <p>
                      OVH SAS
                      <br />
                      2 rue Kellermann
                      <br />
                      59100 Roubaix, France
                      <br />
                      Téléphone : +33 9 72 10 10 07
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Services cloud
                    </h3>
                    <p>
                      Amazon Web Services (AWS)
                      <br />
                      Services de stockage et de calcul distribué
                    </p>
                  </div>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section id="article-04" className={s.articleSection}>
                <h2 className={s.articleTitle}>
                  Propriété intellectuelle
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    L&apos;ensemble du contenu de ce site web (textes, images,
                    vidéos, logos, icônes, sons, logiciels, etc.) est la
                    propriété exclusive d&apos;Inkera Studio SAS ou de ses
                    partenaires et est protégé par les lois françaises et
                    internationales relatives à la propriété intellectuelle.
                  </p>

                  <p>
                    Toute reproduction, représentation, modification,
                    publication, adaptation, ou exploitation totale ou partielle
                    du contenu, par quelque procédé que ce soit, est strictement
                    interdite sans l&apos;autorisation écrite préalable
                    d&apos;Inkera Studio SAS.
                  </p>

                  <div className="bg-white/5 rounded-xl p-5 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Marques et logos
                    </h3>
                    <p>
                      La marque &quot;Inkera Studio&quot; ainsi que tous les
                      logos et éléments graphiques associés sont des marques
                      déposées d&apos;Inkera Studio SAS. Leur utilisation est
                      strictement réglementée.
                    </p>
                  </div>
                </div>
              </section>

              {/* Responsabilité */}
              <section id="article-05" className={s.articleSection}>
                <h2 className={s.articleTitle}>
                  Limitation de responsabilité
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Inkera Studio SAS met tout en œuvre pour fournir des
                    informations exactes et à jour sur son site web. Cependant,
                    nous ne pouvons garantir l&apos;exactitude, la précision ou
                    l&apos;exhaustivité des informations mises à disposition.
                  </p>

                  <p>
                    L&apos;utilisation des informations et services proposés sur
                    ce site se fait sous l&apos;entière responsabilité de
                    l&apos;utilisateur. Inkera Studio SAS ne saurait être tenue
                    responsable des dommages directs ou indirects résultant de
                    l&apos;utilisation du site ou de l&apos;impossibilité
                    d&apos;y accéder.
                  </p>

                  <div className="bg-white/5 rounded-xl p-5 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Disponibilité du service
                    </h3>
                    <p>
                      Nous nous efforçons de maintenir notre service accessible
                      24h/24 et 7j/7, mais nous ne pouvons garantir une
                      disponibilité continue en raison de maintenances
                      techniques ou de circonstances indépendantes de notre
                      volonté.
                    </p>
                  </div>
                </div>
              </section>

              {/* Données personnelles */}
              <section id="article-06" className={s.articleSection}>
                <h2 className={s.articleTitle}>
                  Protection des données personnelles
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Conformément au Règlement Général sur la Protection des
                    Données (RGPD) et à la loi &quot;Informatique et
                    Libertés&quot;, vous disposez de droits sur vos données
                    personnelles.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-xl p-5">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Responsable de traitement
                      </h3>
                      <p>Inkera Studio SAS</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Contact DPO
                      </h3>
                      <p>contact@inkera-studio.com</p>
                    </div>
                  </div>

                  <p className="mt-6">
                    Pour exercer vos droits (accès, rectification, effacement,
                    portabilité, limitation du traitement, opposition), vous
                    pouvez nous contacter à l'adresse : contact@Inkera Studio.fr
                  </p>
                </div>
              </section>

              {/* Droit applicable */}
              <section id="article-07" className={s.articleSection}>
                <h2 className={s.articleTitle}>
                  Droit applicable et juridiction
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les présentes mentions légales et l'utilisation du site
                    Inkera Studio sont régies par le droit français. En cas de
                    litige, et à défaut de résolution amiable, les tribunaux
                    français seront seuls compétents.
                  </p>

                  <div className="bg-white/5 rounded-xl p-5 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Médiation
                    </h3>
                    <p>
                      Conformément à l'article L. 616-1 du Code de la
                      consommation, nous proposons un dispositif de médiation de
                      la consommation. Le médiateur peut être saisi sur le site
                      : www.mediation-conso.fr
                    </p>
                  </div>
                </div>
              </section>

              {/* Dernière mise à jour */}
              <div className={s.updated}>
                <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-6 py-3">
                  <span className="text-white/70 font-one text-sm">
                    Dernière mise à jour :{" "}
                    {new Date().toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

  </LegalPage>;
}
