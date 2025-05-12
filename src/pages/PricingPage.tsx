
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PricingTier {
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline";
}

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);
  const { toast } = useToast();

  const pricingTiers: PricingTier[] = [
    {
      title: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Essential networking tools for professionals",
      features: [
        "Professional profile",
        "Connect with up to 100 professionals",
        "Access to industry feed",
        "Basic job search",
        "Standard messaging",
      ],
      highlighted: false,
      buttonText: "Get Started",
      buttonVariant: "outline",
    },
    {
      title: "Professional",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      description: "Advanced tools for growing professionals",
      features: [
        "All Free features",
        "Unlimited connections",
        "Enhanced profile visibility",
        "Priority in search results",
        "Priority job applications",
        "Advanced messaging features",
        "Profile analytics",
      ],
      highlighted: true,
      buttonText: "Subscribe Now",
      buttonVariant: "default",
    },
    {
      title: "Business",
      monthlyPrice: 24.99,
      yearlyPrice: 249.99,
      description: "Complete solution for businesses and recruiters",
      features: [
        "All Professional features",
        "Company page with analytics",
        "Recruiter search tools",
        "Unlimited job postings",
        "Candidate tracking system",
        "Bulk messaging",
        "API access",
        "Dedicated account manager",
      ],
      highlighted: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ];

  const handlePricingClick = (tier: string) => {
    if (tier === "Free") {
      toast({
        title: "Free Plan Selected",
        description: "You can start using SiGMA Hub right away!",
      });
    } else if (tier === "Professional") {
      toast({
        title: "Professional Plan Selected",
        description: "You'll be redirected to complete your subscription.",
      });
    } else {
      toast({
        title: "Business Plan Selected",
        description: "Our sales team will contact you shortly.",
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Pricing Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">
                SiGMA Hub Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the right plan for your professional journey
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-2">
              <span className={cn("text-sm", !annual && "font-medium")}>Monthly</span>
              <Switch
                checked={annual}
                onCheckedChange={setAnnual}
              />
              <span className={cn("text-sm", annual && "font-medium")}>
                Annual <span className="text-xs text-sigma-blue">(Save 15%)</span>
              </span>
            </div>
          </motion.div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={cn(
                  "glass-card p-8 rounded-xl relative",
                  tier.highlighted && "border-2 border-sigma-purple"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-gradient-to-r from-sigma-blue to-sigma-purple text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold">{tier.title}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">
                    ${annual ? tier.yearlyPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    {tier.monthlyPrice > 0 ? (annual ? "/year" : "/month") : ""}
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">{tier.description}</p>

                <Link to={tier.title === "Free" ? "/auth?signup=true" : "#"}>
                  <Button
                    className={cn(
                      "w-full mb-6",
                      tier.buttonVariant === "default" && "bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                    )}
                    variant={tier.buttonVariant}
                    onClick={() => handlePricingClick(tier.title)}
                  >
                    {tier.buttonText}
                  </Button>
                </Link>

                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-sigma-blue"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-8 rounded-xl mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold mb-2">Can I change my plan later?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be effective immediately with prorated billing adjustments.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold mb-2">Is there a free trial for paid plans?</h3>
                <p className="text-muted-foreground">Yes, both Professional and Business plans include a 14-day free trial. No credit card is required to start your trial.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold mb-2">What payment methods are accepted?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and bank transfers for annual business subscriptions.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold mb-2">Can I get a refund if I'm not satisfied?</h3>
                <p className="text-muted-foreground">We offer a 30-day money-back guarantee for all new subscriptions if you're not completely satisfied with our service.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold mb-2">Do you offer special pricing for startups?</h3>
                <p className="text-muted-foreground">Yes, we offer special startup packages for companies less than 2 years old with fewer than 10 employees. Contact our sales team for details.</p>
              </div>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12"
          >
            <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-muted-foreground mb-6">
              Contact our sales team to create a tailored plan for your organization's specific needs.
            </p>
            <Button 
              onClick={() => {
                toast({
                  title: "Contact Request Received",
                  description: "Our team will reach out to you shortly.",
                });
              }}
              className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white px-8"
            >
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
