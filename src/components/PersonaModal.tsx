import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, User, Check } from "lucide-react";
import {
  createPersona,
  updatePersona,
  deletePersona,
  getUserPersonas,
  PersonaData,
  createAuthenticatedSupabaseClient
} from "@/lib/supabase";
import { toast } from "sonner";

interface PersonaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonaSelect?: (persona: any) => void;
  currentPersona?: any;
}

interface PersonaRecord {
  id: string;
  user_id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function PersonaModal({ open, onOpenChange, onPersonaSelect, currentPersona }: PersonaModalProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [personas, setPersonas] = useState<PersonaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPersona, setEditingPersona] = useState<PersonaRecord | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Non-binary'>('Male');
  const [description, setDescription] = useState("");
  const [applyToNewChats, setApplyToNewChats] = useState(false);

  // Helper function to get authenticated Supabase client
  const getAuthenticatedClient = async () => {
    try {
      console.log('🔑 Getting Clerk token for Supabase...');
      const token = await getToken({ template: 'supabase' });
      console.log('🔑 Token received:', token ? 'Yes' : 'No');

      if (!token) {
        console.error('❌ No token available, trying default token...');
        // Try getting default token if supabase template doesn't exist
        const defaultToken = await getToken();
        console.log('🔑 Default token received:', defaultToken ? 'Yes' : 'No');

        if (!defaultToken) {
          throw new Error('No authentication token available');
        }
        return createAuthenticatedSupabaseClient(defaultToken);
      }
      return createAuthenticatedSupabaseClient(token);
    } catch (error) {
      console.error('❌ Error getting authenticated client:', error);
      throw error;
    }
  };

  // Load personas when modal opens
  useEffect(() => {
    if (open && user) {
      loadPersonas();
    }
  }, [open, user]);

  const loadPersonas = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const authenticatedClient = await getAuthenticatedClient();
      const userPersonas = await getUserPersonas(user.id, authenticatedClient);
      setPersonas(userPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedGender('Male');
    setDescription("");
    setApplyToNewChats(false);
    setEditingPersona(null);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (persona: PersonaRecord) => {
    setName(persona.name);
    setSelectedGender(persona.gender);
    setDescription(persona.description || "");
    setApplyToNewChats(persona.is_default);
    setEditingPersona(persona);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    try {
      console.log('💾 Starting persona save process...');
      const authenticatedClient = await getAuthenticatedClient();
      console.log('✅ Got authenticated client');

      const personaData: Omit<PersonaData, 'id'> = {
        name: name.trim(),
        gender: selectedGender,
        description: description.trim(),
        applyToNewChats
      };

      console.log('📝 Persona data:', personaData);

      if (editingPersona) {
        // Update existing persona
        console.log('🔄 Updating persona:', editingPersona.id);
        await updatePersona(editingPersona.id, personaData, authenticatedClient);
        toast.success('Persona updated successfully!');
      } else {
        // Create new persona
        console.log('✨ Creating new persona for user:', user.id);
        await createPersona(user.id, personaData, authenticatedClient);
        toast.success('Persona created successfully!');
      }

      await loadPersonas(); // Reload the list
      resetForm();
    } catch (error) {
      console.error('❌ Error saving persona:', error);

      // More specific error messages
      if (error.message?.includes('JWT')) {
        toast.error('Authentication error: Please check Clerk JWT configuration');
      } else if (error.message?.includes('permission')) {
        toast.error('Permission denied: Please check database policies');
      } else if (error.message?.includes('token')) {
        toast.error('Authentication token missing or invalid');
      } else {
        toast.error(`Failed to save persona: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (persona: PersonaRecord) => {
    if (!confirm(`Are you sure you want to delete "${persona.name}"?`)) return;

    try {
      const authenticatedClient = await getAuthenticatedClient();
      await deletePersona(persona.id, authenticatedClient);
      toast.success('Persona deleted successfully!');
      await loadPersonas(); // Reload the list
    } catch (error) {
      console.error('Error deleting persona:', error);
      toast.error('Failed to delete persona');
    }
  };

  const handleSelectPersona = (persona: PersonaRecord) => {
    onPersonaSelect?.(persona);
    toast.success(`Switched to "${persona.name}" persona`);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const isFormValid = name.trim().length > 0;
  const showForm = isCreating;
  const showList = !isCreating;

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-[#1a1b2e] border-[#2d2e3e] p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden [&>button]:hidden">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-4 py-3 flex-shrink-0 border-b border-[#2d2e3e]">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white text-sm p-0"
                style={{ fontSize: '14px' }}
                onClick={showForm ? resetForm : handleCancel}
              >
                {showForm ? 'Back' : 'Cancel'}
              </Button>
              <DialogTitle className="text-lg font-bold text-white" style={{ fontSize: '14px' }}>
                {showForm ? (editingPersona ? 'Edit Persona' : 'Create Persona') : 'Personas'}
              </DialogTitle>
              {showForm ? (
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white text-sm p-0"
                  style={{ fontSize: '14px' }}
                  onClick={handleSave}
                  disabled={!isFormValid}
                >
                  Save
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white text-sm p-0"
                  style={{ fontSize: '14px' }}
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-4 py-4 flex-1 overflow-y-auto min-h-0">
            {showList && (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="bg-[#2d2e3e] border-[#3d3e4e] animate-pulse">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : personas.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1" style={{ fontSize: '14px' }}>
                      No personas yet
                    </h3>
                    <p className="text-gray-500 text-xs mb-4" style={{ fontSize: '12px' }}>
                      Create your first persona to personalize your chats
                    </p>
                    <Button
                      onClick={handleCreateNew}
                      className="bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white"
                      style={{ fontSize: '12px' }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Persona
                    </Button>
                  </div>
                ) : (
                  personas.map((persona) => (
                    <Card
                      key={persona.id}
                      className={`bg-[#2d2e3e] border-[#3d3e4e] hover:bg-[#34354a] transition-colors cursor-pointer ${
                        currentPersona?.id === persona.id ? 'ring-2 ring-[#e74c8c]' : ''
                      }`}
                      onClick={() => handleSelectPersona(persona)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white text-sm">
                              {persona.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate text-sm">
                                {persona.name}
                              </h3>
                              {persona.is_default && (
                                <Badge className="bg-yellow-500 text-black text-xs px-1 py-0">
                                  Default
                                </Badge>
                              )}
                              {currentPersona?.id === persona.id && (
                                <Check className="h-4 w-4 text-[#e74c8c]" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                              <span>{persona.gender}</span>
                            </div>
                            
                            {persona.description && (
                              <p className="text-gray-300 text-xs truncate">
                                {persona.description}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(persona);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(persona);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {showForm && (
              <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <Input
                    placeholder="Type your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#2d2e3e] border-[#3d3e4e] text-white placeholder-gray-400 text-xs"
                    style={{ fontSize: '12px' }}
                    maxLength={30}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                      Your name in the conversation
                    </span>
                    <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                      {name.length}/30
                    </span>
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                    Gender
                  </h3>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Non-binary'] as const).map((gender) => (
                      <Button
                        key={gender}
                        variant={selectedGender === gender ? 'default' : 'outline'}
                        className={`flex-1 rounded-2xl py-2 border-0 text-xs font-medium ${
                          selectedGender === gender
                            ? 'bg-gradient-to-r from-[#e74c8c] to-[#c44f93] text-white shadow-lg'
                            : 'bg-[#2d2e3e] text-gray-300 hover:bg-[#34354a] border-[#3d3e4e]'
                        }`}
                        style={{ fontSize: '12px' }}
                        onClick={() => setSelectedGender(gender)}
                      >
                        {gender}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                    Description
                  </h3>
                  <Textarea
                    placeholder="e.g. I'm an 18-year-old college student and {{char}} is my best friend."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#2d2e3e] border-[#3d3e4e] text-white placeholder-gray-400 min-h-[120px] resize-none text-xs"
                    style={{ fontSize: '12px' }}
                    maxLength={1500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                      Describe your identity, background, or relationship to the character.
                    </span>
                    <span className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                      {description.length}/1500
                    </span>
                  </div>
                </div>

                {/* Apply to new chats toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-white font-medium" style={{ fontSize: '14px' }}>
                        Apply to new chats
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                          Set as default for new chats.
                        </p>
                        <p className="text-gray-500 text-xs" style={{ fontSize: '12px' }}>
                          Bot will recognize your persona if allowed in its description.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={applyToNewChats}
                      onCheckedChange={setApplyToNewChats}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
