import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle } from "lucide-react";
import { updateUserProfile } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import ProfileImageSelection from "./ProfileImageSelection";

interface ProfileEditFormProps {
  user: any;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileEditForm = ({ user, onCancel, onSave }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    headline: user?.headline || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    experience: user?.experience || [],
    education: user?.education || []
  });
  const [saving, setSaving] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData({ ...formData, skills: updatedSkills });
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ""] });
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setFormData({ ...formData, experience: updatedExperience });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { title: "", company: "", duration: "", description: "" }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    setFormData({ ...formData, experience: updatedExperience });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData({ ...formData, education: updatedEducation });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { school: "", degree: "", duration: "" }
      ]
    });
  };

  const removeEducation = (index: number) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    setFormData({ ...formData, education: updatedEducation });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Filter out empty skills
      const filteredSkills = formData.skills.filter(skill => skill.trim() !== "");
      
      // Filter out empty experiences
      const filteredExperience = formData.experience.filter(exp => 
        exp.title.trim() !== "" || exp.company.trim() !== ""
      );
      
      // Filter out empty education
      const filteredEducation = formData.education.filter(edu => 
        edu.school.trim() !== "" || edu.degree.trim() !== ""
      );
      
      const updatedUser = {
        ...formData,
        skills: filteredSkills,
        experience: filteredExperience,
        education: filteredEducation,
        photoURL
      };
      
      await updateUserProfile(user.id, updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      onSave();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="grid md:grid-cols-[150px_1fr] gap-4 items-start">
        <div className="flex justify-center md:justify-start">
          <ProfileImageSelection 
            currentPhotoURL={photoURL} 
            onPhotoUpdated={setPhotoURL}
            size="md"
          />
        </div>
        
        <div className="space-y-4">
          <div className="text-left">
            <Label htmlFor="displayName">Full Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Your name"
              required
            />
          </div>
          
          <div className="text-left">
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="Your professional headline (e.g., 'Senior Developer at Company')"
            />
          </div>
          
          <div className="text-left">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>
        </div>
      </div>
      
      <div className="text-left">
        <Label htmlFor="bio">About</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell others about yourself, your experience, and interests..."
          rows={5}
        />
      </div>
      
      <div className="text-left">
        <div className="flex justify-between items-center mb-2">
          <Label>Skills</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkill}
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Add Skill
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                placeholder="Skill (e.g., React, JavaScript, SQL)"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSkill(index)}
              >
                <MinusCircle className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          
          {formData.skills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet. Add your professional skills to help others understand your expertise.</p>
          )}
        </div>
      </div>
      
      <div className="text-left">
        <div className="flex justify-between items-center mb-2">
          <Label>Experience</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExperience}
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Add Experience
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.experience.map((exp, index) => (
            <div key={index} className="glass-card p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Position {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExperience(index)}
                >
                  <MinusCircle className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              
              <div className="grid gap-3 mt-2">
                <div>
                  <Label htmlFor={`exp-title-${index}`}>Title</Label>
                  <Input
                    id={`exp-title-${index}`}
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                    placeholder="Job Title"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`exp-company-${index}`}>Company</Label>
                  <Input
                    id={`exp-company-${index}`}
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`exp-duration-${index}`}>Duration</Label>
                  <Input
                    id={`exp-duration-${index}`}
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(index, "duration", e.target.value)}
                    placeholder="Jan 2020 - Present"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`exp-description-${index}`}>Description</Label>
                  <Textarea
                    id={`exp-description-${index}`}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {formData.experience.length === 0 && (
            <p className="text-sm text-muted-foreground">No experience added yet. Add your work experience to highlight your professional journey.</p>
          )}
        </div>
      </div>
      
      <div className="text-left">
        <div className="flex justify-between items-center mb-2">
          <Label>Education</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.education.map((edu, index) => (
            <div key={index} className="glass-card p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Education {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(index)}
                >
                  <MinusCircle className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              
              <div className="grid gap-3 mt-2">
                <div>
                  <Label htmlFor={`edu-school-${index}`}>Institution</Label>
                  <Input
                    id={`edu-school-${index}`}
                    value={edu.school}
                    onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                    placeholder="School or University"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                  <Input
                    id={`edu-degree-${index}`}
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                    placeholder="Degree or Certificate"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`edu-duration-${index}`}>Duration</Label>
                  <Input
                    id={`edu-duration-${index}`}
                    value={edu.duration}
                    onChange={(e) => handleEducationChange(index, "duration", e.target.value)}
                    placeholder="2015 - 2019"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {formData.education.length === 0 && (
            <p className="text-sm text-muted-foreground">No education added yet. Add your academic background to showcase your qualifications.</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.form>
  );
};

export default ProfileEditForm;
