import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';

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

  const features = [
    "Unlimited Connections",
    "Full Messaging Features",
    "Job Postings & Applications",
    "Professional Profile",
    "Network Analytics",
    "Community Access",
    "Real-time Notifications",
    "Advanced Search",
    "Custom Feed",
    "Priority Support"
  ];

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
    <div className="min-h-screen pt-20 pb-12 px-2 sm:px-4 bg-background">
      <div className="w-full sm:container sm:mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full sm:max-w-4xl sm:mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">
              Always Free, Forever
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12">
            Join our community and access all features at no cost
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 mb-12"
          >
            <div className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">
              $0
            </div>
            <p className="text-xl text-muted-foreground mb-8">per month</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-muted-foreground"
          >
            We believe in building a strong community without barriers. That's why SiGMA Hub is and always will be free for everyone.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
