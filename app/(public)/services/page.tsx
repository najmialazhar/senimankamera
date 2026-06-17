import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Check, Clock, Users, BookOpen, Image as ImageIcon, MapPin } from "lucide-react";

export default function ServicesPage() {
  const faqs = [
    {
      question: "How far in advance should we book?",
      answer: "For weddings, we recommend reaching out 9 to 12 months in advance, especially for dates between May and October. For portraits and smaller events, 2 to 3 months is typically sufficient."
    },
    {
      question: "Do you travel for destination weddings?",
      answer: "Absolutely. We frequently travel internationally for assignments. Custom travel quotes are provided during the consultation process, typically covering flights, 2 nights of accommodation, and ground transport."
    },
    {
      question: "What is your turnaround time for galleries?",
      answer: "We pride ourselves on meticulous editing. Portrait sessions are delivered within 3 weeks. Complete wedding galleries are delivered within 6 to 8 weeks, with a selection of 'sneak peek' images provided within 72 hours of the event."
    },
    {
      question: "Can we order physical prints and albums through you?",
      answer: "Yes, our signature wedding package includes a fine art heirloom album. Additionally, your online gallery connects directly to our partner professional lab, allowing you and your guests to order museum-quality prints, framed art, and canvas seamlessly."
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 md:px-20 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-6 block font-bold">
          Curated Offerings
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-primary max-w-4xl mb-8 font-medium">
          Invest in timeless artistry.
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto font-light leading-relaxed">
          We believe in capturing moments with intentionality. Our packages are designed to provide a comprehensive, editorial approach to your most significant days, ensuring every frame is a lasting piece of art.
        </p>
      </section>

      {/* Packages Section (Asymmetric Grid) */}
      <section className="py-16 px-6 md:px-20 w-full max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Package 1: Signature Wedding (Featured, spans 7 cols) */}
          <div className="lg:col-span-7 bg-card border border-border/40 p-8 md:p-12 hover:-translate-y-1 transition-transform duration-500 shadow-sm relative overflow-hidden">
            <span className="font-sans text-[10px] uppercase tracking-widest text-primary border border-primary px-3 py-1 font-bold mb-6 inline-block">
              The Flagship
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4 font-medium">
              Signature Wedding
            </h2>
            <p className="font-sans text-base text-secondary mb-8 max-w-md font-light leading-relaxed">
              An immersive, all-day documentation of your celebration. Focused on candid emotion, editorial portraiture, and intricate details.
            </p>
            <div className="text-3xl font-serif text-primary mb-8 border-b border-border/20 pb-8 font-medium">
              Starts at $4,500
            </div>
            
            <ul className="space-y-4 font-sans text-sm text-secondary mb-12">
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>Up to 10 hours of consecutive coverage</span>
              </li>
              <li className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <span>Two lead photographers for diverse perspectives</span>
              </li>
              <li className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>800+ color-graded high-resolution images</span>
              </li>
              <li className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Fine Art 10x10 Heirloom Album included</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Curated online gallery with print store access</span>
              </li>
            </ul>

            <Button className="w-full md:w-auto font-sans text-xs uppercase tracking-widest px-8 py-6 rounded-none">
              Inquire for Availability
            </Button>
          </div>

          {/* Package 2 & 3 Column (spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:mt-12">
            
            {/* Package 2: Artistic Portrait */}
            <div className="bg-card border border-border/40 p-8 hover:-translate-y-1 transition-transform duration-500">
              <h3 className="font-serif text-2xl text-primary mb-2 font-medium">
                Artistic Portrait
              </h3>
              <p className="font-sans text-sm text-secondary mb-6 font-light">
                Editorial sessions for individuals, couples, or personal branding.
              </p>
              <div className="font-serif text-xl text-primary mb-6 font-medium">
                Starts at $850
              </div>
              <ul className="space-y-3 font-sans text-sm text-secondary mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <span>2 hours of on-location or studio shooting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <span>50 hand-retouched editorial images</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <span>Creative direction and styling consultation</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full font-sans text-xs uppercase tracking-widest py-5 rounded-none border-primary text-primary hover:bg-primary hover:text-on-primary">
                Book Session
              </Button>
            </div>

            {/* Package 3: Event Documentation */}
            <div className="bg-card border border-border/40 p-8 hover:-translate-y-1 transition-transform duration-500">
              <h3 className="font-serif text-2xl text-primary mb-2 font-medium">
                Event Documentation
              </h3>
              <p className="font-sans text-sm text-secondary mb-6 font-light">
                Discreet, high-end coverage for corporate galas, private dinners, and brand launches.
              </p>
              <div className="font-serif text-xl text-primary mb-6 font-medium">
                $400 / hour <span className="text-xs text-secondary font-sans font-normal">(3hr min)</span>
              </div>
              <ul className="space-y-3 font-sans text-sm text-secondary mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <span>Candid, unobtrusive photojournalism style</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <span>Rapid 48-hour turnaround for select PR images</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-secondary mt-0.5" />
                  <span>Full commercial usage rights included</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full font-sans text-xs uppercase tracking-widest py-5 rounded-none border-primary text-primary hover:bg-primary hover:text-on-primary">
                Request Quote
              </Button>
            </div>

          </div>
        </div>

        {/* Custom Notice */}
        <div className="mt-16 text-center border-t border-border/40 pt-12 max-w-2xl mx-auto">
          <p className="font-sans text-sm text-secondary leading-relaxed">
            Looking for something unique? We offer bespoke collections tailored to destination weddings, multi-day events, and specialized editorial campaigns.{" "}
            <a href="/#contact" className="text-primary underline hover:opacity-80 transition-opacity">
              Contact us for a custom proposal.
            </a>
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Large Image */}
            <div className="w-full lg:w-1/2">
              <div className="relative w-full aspect-[3/4] overflow-hidden border border-border/40 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7QcuFR6RlyniK0n75FPkuJGk_votVRrsxgSvvGJc5xDjRZKIcKyHllIZiiISw24E-H7qhF4UvDWsMY2thBAzg9Gy_4r9WQbJWBHB_9PonlyKMQHBp155CChj7Sn3AFoS32ezeuAOQS3g-DK67z1qWnmHJDaGvOSrEGSNqx-TI31NBtp7kdnx4MFGBrYPMGz0PXJVZrNnSpoQTSqvPtXi5R2m0aXDZoWLwYBmj5-bBk3cSA0uHyF_1q60yi9x1-plUwnOzR11CrThp"
                  alt="Couple walking in desert landscape"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Quote details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-8 block font-bold">
                Client Experiences
              </span>
              
              <div className="mb-16 relative">
                <span className="text-8xl font-serif text-border/25 leading-none absolute -left-8 -top-8 select-none">
                  “
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-primary relative z-10 mb-6 font-medium leading-relaxed">
                  They didn't just take pictures; they preserved the exact feeling of the day. Every image looks like a frame from a classic film.
                </h3>
                <div className="font-sans text-sm text-secondary font-semibold">
                  Eleanor & James <span className="mx-2 text-border">•</span> Destination Wedding in Tuscany
                </div>
              </div>

              <div className="border-t border-border/40 pt-8">
                <p className="font-sans text-base text-secondary italic mb-4">
                  "The level of professionalism and artistic vision was unparalleled. We felt completely at ease, and the final gallery exceeded our wildest expectations."
                </p>
                <div className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                  Sarah Jenkins, Editorial Portrait Client
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 px-6 md:px-20 w-full max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4 font-medium">
            Details & Inquiries
          </h2>
          <p className="font-sans text-sm text-secondary font-light">
            Common questions regarding our process and deliverables.
          </p>
        </div>

        <Accordion className="w-full space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/40 pb-2">
              <AccordionTrigger className="font-serif text-lg text-primary py-4 hover:no-underline hover:text-secondary transition-colors font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="font-sans text-sm text-secondary leading-relaxed pt-2 pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
