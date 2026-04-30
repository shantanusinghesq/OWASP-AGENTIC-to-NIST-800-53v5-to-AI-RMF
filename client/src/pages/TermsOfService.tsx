/*
 * Design: "Command Center" — Military-Grade Intelligence Dashboard
 * Terms of Service page with dark tactical styling
 * Consistent with the main app's design language
 */

import { Link } from "wouter";
import { ArrowLeft, Shield, Scale, FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="container py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Crosswalk
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Terms of Service</h1>
              <p className="text-xs text-slate-400">Last Updated: March 14, 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8 max-w-4xl">
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-slate-100 prose-headings:font-bold
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-strong:text-white
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
          prose-li:text-slate-300
          prose-hr:border-slate-700/50
        ">

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the OWASP Agentic AI ↔ NIST Crosswalk web application (the "Service"), hosted at its official deployment URL, you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you must not access or use the Service. These Terms constitute a legally binding agreement between you and the developer and operator of the Service ("Developer," "we," "us," or "our").
            </p>
            <p>
              These Terms govern your use of the <strong>hosted web application</strong> (the "Service") as distinct from the underlying open-source codebase, which is separately licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). The AGPL-3.0 license governs your rights to the source code; these Terms govern your use of the hosted Service.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
              2. Distinction Between Source Code and the Service
            </h2>
            <p>
              The source code for this project is made available under the AGPL-3.0 license at{" "}
              <a href="https://github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF" target="_blank" rel="noopener noreferrer">
                github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF
              </a>. Under the AGPL-3.0, you have the right to use, study, modify, and redistribute the source code, provided that any modified versions or derivative works are also licensed under the AGPL-3.0 and that the source code is made available to users who interact with the software over a network.
            </p>
            <p>
              <strong>However, the hosted Service is not the source code.</strong> The Service includes proprietary deployment configurations, infrastructure, domain, branding, design assets, hosting environment, and operational elements that are not covered by the AGPL-3.0 license. You may not copy, replicate, mirror, scrape, or create a substantially similar hosted service using the visual design, layout, user experience, branding, or trade dress of this Service without the Developer's prior written consent. Running your own instance from the AGPL-3.0 source code is permitted under the terms of that license; copying the hosted Service's presentation, branding, and operational configuration is not.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
              3. Permitted Use
            </h2>
            <p>
              You are granted a limited, non-exclusive, non-transferable, revocable right to access and use the Service for lawful purposes, including personal, educational, and professional use in the fields of cybersecurity, compliance, risk management, and governance. Specifically, you may view and interact with the crosswalk data, heatmaps, and evidence explorer through the Service's user interface; reference the crosswalk mappings in your own compliance documentation, audit reports, risk assessments, and internal governance materials with appropriate attribution; and share links to the Service with colleagues, clients, or other stakeholders.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-red-500 inline-block" />
              4. Prohibited Conduct
            </h2>
            <p>
              <strong>4.1 Service Replication.</strong> You may not copy, mirror, frame, scrape, crawl, or otherwise reproduce the Service or any substantial portion of its content, design, or functionality for the purpose of creating a competing or substantially similar hosted service, whether for commercial or non-commercial purposes.
            </p>
            <p>
              <strong>4.2 Automated Access.</strong> You may not use bots, scrapers, spiders, crawlers, or any other automated means to access, download, or extract data from the Service, except as expressly permitted by a robots.txt file or with the Developer's prior written consent.
            </p>
            <p>
              <strong>4.3 Reverse Engineering of Service Infrastructure.</strong> While the source code is available under the AGPL-3.0, you may not reverse engineer, decompile, or disassemble the Service's deployment infrastructure, hosting configuration, or operational environment.
            </p>
            <p>
              <strong>4.4 Circumvention.</strong> You may not circumvent, disable, or interfere with any security, access control, rate-limiting, or authentication mechanisms of the Service.
            </p>
            <p>
              <strong>4.5 Misrepresentation.</strong> You may not represent yourself as the Developer, claim affiliation with the Developer, or imply endorsement by the Developer, OWASP, NIST, or any other organization referenced in the crosswalk data.
            </p>
            <p>
              <strong>4.6 Harmful Use.</strong> You may not use the Service to facilitate any illegal activity, to distribute malware, to conduct denial-of-service attacks, or to engage in any activity that could harm the Service, its infrastructure, or its users.
            </p>
            <p>
              <strong>4.7 Commercial Resale.</strong> You may not resell, sublicense, or commercially redistribute access to the Service without the Developer's prior written consent. This prohibition does not apply to the source code, which is governed by the AGPL-3.0.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
              5. Intellectual Property
            </h2>
            <p>
              <strong>5.1 Source Code.</strong> The source code is licensed under the AGPL-3.0. Your rights to the source code are governed exclusively by that license.
            </p>
            <p>
              <strong>5.2 Service Design and Branding.</strong> The visual design, layout, color scheme, typography, user interface elements, animations, and overall "look and feel" of the hosted Service are the proprietary intellectual property of the Developer and are not licensed under the AGPL-3.0. These elements are protected by applicable copyright, trade dress, and intellectual property laws.
            </p>
            <p>
              <strong>5.3 Crosswalk Data.</strong> The crosswalk mapping data (the associations between OWASP ASI risks, NIST 800-53 controls, and AI-RMF categories, including rationale text and evidence citations) is included in the AGPL-3.0-licensed source code and may be used, modified, and redistributed under the terms of that license.
            </p>
            <p>
              <strong>5.4 Third-Party Content.</strong> The Service references and incorporates information from OWASP, NIST, and other third-party sources. These references are made for informational and educational purposes. OWASP, NIST, and all other third-party trademarks, names, and content remain the property of their respective owners.
            </p>
            <p>
              <strong>5.5 Generated Images and Assets.</strong> Any images, icons, or visual assets generated specifically for the hosted Service's user interface are the proprietary property of the Developer and are not included in the AGPL-3.0 license grant.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" />
              6. Disclaimer of Warranties
            </h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-md p-4 text-xs text-red-300/90 uppercase tracking-wide leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, COMPLETENESS, OR RELIABILITY. THE DEVELOPER DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </div>
            <p className="mt-4">
              <strong>The crosswalk mappings are provided for informational and educational purposes only.</strong> They do not constitute legal advice, compliance certification, audit guidance, or professional recommendations. Users should consult qualified legal, compliance, and cybersecurity professionals before making decisions based on the crosswalk data.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" />
              7. Limitation of Liability
            </h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-md p-4 text-xs text-red-300/90 uppercase tracking-wide leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE DEVELOPER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES. THE DEVELOPER'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100.00).
            </div>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
              8. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless the Developer, its affiliates, licensors, and service providers, and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms, your use of the Service, or your violation of any rights of a third party.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
              9. Privacy
            </h2>
            <p>
              The Service does not collect, store, or process personal data beyond standard web server access logs (IP address, user agent, timestamp, and requested URL). The Service does not use cookies for tracking, does not employ third-party analytics services that collect personal data, and does not require user registration or authentication.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
              10. Availability and Modification
            </h2>
            <p>
              The Developer reserves the right to modify, suspend, or discontinue the Service at any time, with or without notice, for any reason. The Developer reserves the right to modify these Terms at any time. Updated Terms will be posted on the Service with a revised "Last Updated" date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-purple-500 inline-block" />
              11. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration. You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
              12. Severability & Entire Agreement
            </h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. These Terms, together with the AGPL-3.0 license (as it applies to the source code), constitute the entire agreement between you and the Developer regarding the Service.
            </p>
          </section>

          <hr />

          <section className="mb-8">
            <h2 className="text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
              13. Contact
            </h2>
            <p>
              For questions about these Terms, the AGPL-3.0 license, or the Service, please open an issue on the project's GitHub repository at{" "}
              <a href="https://github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF" target="_blank" rel="noopener noreferrer">
                github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF
              </a>.
            </p>
          </section>

          <div className="mt-10 p-4 rounded-md border border-blue-500/30 bg-blue-500/5 text-center">
            <p className="text-xs text-blue-300/80">
              By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
