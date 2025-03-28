import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CSVUploader from '@/components/CSVUploader';
import { Database, Users, FileSpreadsheet, Info, CircleHelp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CSVImport = () => {
  const [importResults, setImportResults] = useState<any>(null);

  const handleUploadComplete = (data: any) => {
    setImportResults(data);
    console.log('Upload completed:', data);
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center mb-8">
        <FileSpreadsheet className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">CSV Data Import</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="deals" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="deals" className="flex items-center">
                <Database className="h-4 w-4 mr-2" /> Pipeline Data
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center" disabled>
                <Users className="h-4 w-4 mr-2" /> User Data
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="deals">
              <CSVUploader onUploadComplete={handleUploadComplete} />
              
              {importResults && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Import Results
                    </CardTitle>
                    <CardDescription>
                      Your data has been successfully imported into the system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{importResults.message}</p>
                    <div className="mt-4 rounded-md bg-gray-50 p-4">
                      <h4 className="text-sm font-medium mb-2">Summary:</h4>
                      <ul className="text-sm space-y-1">
                        <li>Total Records: {importResults.deals?.length}</li>
                        <li>Success Rate: 100%</li>
                        <li>Import Date: {new Date().toLocaleString()}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="users">
              <div className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">User data import will be available in a future update.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" /> CSV Import Guide
              </CardTitle>
              <CardDescription>
                Learn how to prepare your CSV data for import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <CircleHelp className="h-4 w-4" />
                <AlertTitle>CSV File Requirements</AlertTitle>
                <AlertDescription>
                  Your CSV file must have headers and include required fields for each data type.
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pipeline-format">
                  <AccordionTrigger className="text-sm font-medium">
                    Pipeline Data Format
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm mb-2">Required fields:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mb-2">
                      <li>name or Name - Deal name</li>
                      <li>value or Value - Numeric value</li>
                      <li>category or Category - "wireless" or "fiber"</li>
                      <li>stage or Stage - Deal stage</li>
                      <li>customerId or CustomerID - Customer ID</li>
                      <li>userId or UserID - Sales rep ID</li>
                    </ul>
                    <p className="text-sm mb-2">Optional fields:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      <li>gpPercentage or GP % - Gross profit percentage</li>
                      <li>expectedCloseDate or Expected Close Date - Date format</li>
                      <li>region or Region - Geographic region</li>
                      <li>clientType or Client Type - Type of client</li>
                      <li>dealType or Deal Type - Type of deal</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="example">
                  <AccordionTrigger className="text-sm font-medium">
                    Example CSV Format
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-xs overflow-x-auto">
                      <pre className="bg-gray-50 p-3 rounded-md">
{`Name,Value,Category,Stage,CustomerID,UserID,GP %,Expected Close Date
Acme Corp Wireless,50000,wireless,negotiation,1,2,25,2025-04-15
Metro Fiber Project,125000,fiber,proposal,3,2,30,2025-05-01
`}
                      </pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips for Successful Import
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                      <li>Make sure your CSV file is UTF-8 encoded</li>
                      <li>Verify that all required fields have values</li>
                      <li>Dates should be in YYYY-MM-DD format</li>
                      <li>Numeric values should not include currency symbols</li>
                      <li>Back up your data before importing large datasets</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium mb-2">Need Help?</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Contact your administrator if you encounter any issues with the import process.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CSVImport;