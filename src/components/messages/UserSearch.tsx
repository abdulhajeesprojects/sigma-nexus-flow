
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle } from 'lucide-react';
import { searchUsersByUsername } from '@/services/firestore';
import { getAvatarForUser } from '@/services/avatars';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UserSearchProps {
  onUserSelect?: (userId: string) => void;
}

export function UserSearch({ onUserSelect }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsersByUsername(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Error",
          description: "Failed to search users",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleUserSelect = (userId: string) => {
    if (onUserSelect) {
      onUserSelect(userId);
    } else {
      navigate(`/messages?userId=${userId}`);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by username (e.g., @username)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {searchResults.length > 0 && (
        <ScrollArea className="h-[300px] mt-2 rounded-md border">
          <div className="p-2">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-md cursor-pointer"
                onClick={() => handleUserSelect(result.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarForUser(result.id, 'professional', 'male')} alt={result.displayName} />
                    <AvatarFallback>{result.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{result.displayName}</p>
                    <p className="text-sm text-muted-foreground">{result.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserSelect(result.id);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {isSearching && (
        <div className="mt-2 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Searching...</p>
        </div>
      )}

      {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="mt-2 text-center text-muted-foreground">
          <p>No users found</p>
        </div>
      )}
    </div>
  );
}
