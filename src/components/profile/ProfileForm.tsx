
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/services/firestore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
  headline: z.string().max(100, "Headline must be less than 100 characters"),
  location: z.string().max(100, "Location must be less than 100 characters"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      headline: "",
      location: "",
      bio: "",
    },
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(firestore, "users", auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          form.reset({
            displayName: userData.displayName || auth.currentUser.displayName || "",
            headline: userData.headline || "",
            location: userData.location || "",
            bio: userData.bio || "",
          });
        } else {
          // If the user document doesn't exist yet, use auth data
          form.reset({
            displayName: auth.currentUser.displayName || "",
            headline: "",
            location: "",
            bio: "",
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile information",
          variant: "destructive",
        });
      }
    };

    loadUserProfile();
  }, [form, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // Update auth profile (for display name)
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
      });

      // Update Firestore profile
      await updateUserProfile(auth.currentUser.uid, {
        displayName: data.displayName,
        headline: data.headline,
        location: data.location,
        bio: data.bio,
        updatedAt: new Date(),
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile",
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
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Headline</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Senior Developer at Tech Company" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write a short bio to tell people more about yourself..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default ProfileForm;
