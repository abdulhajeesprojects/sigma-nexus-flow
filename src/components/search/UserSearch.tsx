import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { searchUsersByUsername } from '@/services/firestore';
import { getAvatarForUser } from '@/services/avatars';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

interface UserSearchProps {
  onUserSelect?: (userId: string) => void;
  className?: string;
}

export function UserSearch({ onUserSelect, className = '' }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchUsersByUsername(debouncedSearchTerm);
        setResults(searchResults);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to search users',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, toast]);

  const handleUserClick = (userId: string) => {
    if (onUserSelect) {
      onUserSelect(userId);
    } else {
      navigate(`/profile/${userId}`);
    }
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search users by @username"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10"
        />
      </div>

      <AnimatePresence>
        {showResults && (searchTerm || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg"
          >
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((user) => (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage
                          src={getAvatarForUser(user.id, 'professional', 'male')}
                          alt={user.displayName}
                        />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-4 text-center text-muted-foreground">
                  No users found
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 