"use client";

import React, { useState } from 'react';
import type { Person } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, UserPlus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface PersonInputFormProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

const initialBulkText = `Olivia Chen, 1985-03-12
Benjamin Carter, 1992-07-24
Sophia Rodriguez, 1978-11-02
William Kim, 2001-01-15
Ava Williams, 1998-09-30`;

export function PersonInputForm({ people, onPeopleChange }: PersonInputFormProps) {
  const { toast } = useToast();
  const [bulkText, setBulkText] = useState(initialBulkText);
  const [append, setAppend] = useState(false);

  const handleUpdatePerson = (id: number, field: 'name' | 'dob', value: string) => {
    const newPeople = people.map((person) => (person.id === id ? { ...person, [field]: value } : person));
    onPeopleChange(newPeople);
  };

  const handleAddPerson = () => {
    onPeopleChange([...people, { id: Date.now(), name: '', dob: '' }]);
  };

  const handleRemovePerson = (id: number) => {
    onPeopleChange(people.filter((person) => person.id !== id));
  };

  const processBulkText = () => {
    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      toast({
        title: 'Input Error',
        description: 'Bulk input is empty. Please provide each person on a new line in the format: Name, DOB.',
        variant: 'destructive',
      });
      return;
    }

    const newPeople: Person[] = lines.map((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      const name = parts[0] || '';
      const dob = parts[1] || '';
      return { id: Date.now() + index, name, dob };
    });

    if (append) {
      onPeopleChange([...people, ...newPeople]);
    } else {
      onPeopleChange(newPeople);
    }
    
    setBulkText('');
    toast({
      title: 'Success',
      description: `Processed ${newPeople.length} people from bulk input.`,
    });
  };

  return (
    <Card className="shadow-lg animate-fade-in border-none bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Group Members</CardTitle>
        <CardDescription>Add or remove people, and enter their information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {people.map((person, index) => (
            <div key={person.id} className="p-3 bg-card/50 rounded-lg space-y-2 border relative animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={person.name}
                    onChange={(e) => handleUpdatePerson(person.id, 'name', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <Input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={person.dob}
                    onChange={(e) => handleUpdatePerson(person.id, 'dob', e.target.value)}
                    className={`w-full ${person.errors?.dob ? 'border-destructive' : ''}`}
                  />
                  {person.errors?.dob && <p className="text-xs text-destructive mt-1">{person.errors.dob}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {person.age !== undefined && (
                  <p className="text-sm text-primary-foreground/80 font-medium rounded-full bg-primary/20 px-3 py-1">Age: {person.age}</p>
                )}
                {person.generation && (
                   <p className="text-sm text-primary-foreground/80 font-medium rounded-full bg-primary/20 px-3 py-1">{person.generation.nickname}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemovePerson(person.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={handleAddPerson} variant="outline" className="w-full">
          <UserPlus className="mr-2 h-4 w-4" /> Add Person
        </Button>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center">
            Bulk Input
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter one person per line, e.g.,<br/>John Doe, 1990-05-15</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <Textarea
            placeholder="Name, YYYY-MM-DD\nName, MM/DD/YYYY..."
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="mt-1"
            rows={6}
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="append-checkbox" checked={append} onCheckedChange={(checked) => setAppend(!!checked)} />
            <Label htmlFor="append-checkbox" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Append to current list
            </Label>
          </div>
          <Button onClick={processBulkText} className="w-full mt-2">Process Bulk Input</Button>
        </div>
      </CardContent>
    </Card>
  );
}
