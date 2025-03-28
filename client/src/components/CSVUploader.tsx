import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Papa from 'papaparse';
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface CSVUploaderProps {
  onUploadComplete?: (data: any) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setParsedData(null);
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const selectedFile = files[0];
    
    // Check if it's a CSV file
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }
    
    setFile(selectedFile);
    
    // Parse the CSV file
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        
        if (results.data.length === 0) {
          setError('The CSV file is empty');
          return;
        }
        
        console.log('Parsed CSV data:', results.data);
        setParsedData(results.data);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (!parsedData) {
      setError('Please select a valid CSV file first');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/deals/import-csv', { csvData: parsedData });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to upload CSV data');
      }
      
      setSuccess(`Successfully uploaded ${result.deals.length} deals`);
      toast({
        title: 'Upload Complete',
        description: `Successfully imported ${result.deals.length} deals from CSV`,
        variant: 'default',
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
      setParsedData(null);
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload CSV data');
      toast({
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Failed to upload CSV data',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-6 w-6" /> Import Pipeline Data
        </CardTitle>
        <CardDescription>
          Upload a CSV file containing your pipeline data. The file should include columns for deal name, value, stage, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Maximum file size: 5MB. Only CSV files are supported.
            </p>
          </div>
          
          {file && parsedData && (
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-5 w-5 text-blue-500" />
                {file.name}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {parsedData.length} records found in file
              </p>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetForm} disabled={uploading}>
          Reset
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!parsedData || uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Upload Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CSVUploader;