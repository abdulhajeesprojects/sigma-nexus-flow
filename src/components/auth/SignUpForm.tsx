
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SignUpFormProps {
  onSwitch: () => void;
}

const SignUpForm = ({ onSwitch }: SignUpFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user profile
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Create user document in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        displayName: fullName,
        email: email,
        photoURL: null,
        createdAt: new Date(),
        headline: "",
        bio: "",
        location: "",
        skills: [],
        education: [],
        experience: []
      });
      
      toast({
        title: "Account created!",
        description: "Welcome to SiGMA Hub! Let's set up your profile.",
      });
      
      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Create Account</h1>
        <p className="text-muted-foreground">Enter your details to create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Full Name
          </label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            required
            minLength={6}
          />
          <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-sigma-purple to-sigma-blue hover:from-sigma-blue hover:to-sigma-purple text-white"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-sigma-blue dark:text-sigma-purple underline-offset-4 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpForm;
