import React, { useState } from "react";
// axios is removed to use the native fetch API
// "./App.css" is replaced with Tailwind CSS for styling

const step1Fields = [
  { name: 'ctl00$ContentPlaceHolder1$txtadharno', id: 'ctl00_ContentPlaceHolder1_txtadharno', type: 'text', placeholder: 'Your Aadhaar No', required: true },
  { name: 'ctl00$ContentPlaceHolder1$txtownername', id: 'ctl00_ContentPlaceHolder1_txtownername', type: 'text', placeholder: 'Name as per Aadhaar', required: true },
  { name: 'ctl00$ContentPlaceHolder1$chkDecarationA', id: 'ctl00_ContentPlaceHolder1_chkDecarationA', type: 'checkbox', placeholder: 'I agree to the Aadhaar declaration.', required: true },
  { name: 'ctl00$ContentPlaceHolder1$txtPan', id: 'ctl00_ContentPlaceHolder1_txtPan', type: 'text', placeholder: 'Enter Pan Number', required: true },
  { name: 'ctl00$ContentPlaceHolder1$txtPanName', id: 'ctl00_ContentPlaceHolder1_txtPanName', type: 'text', placeholder: 'Name as per PAN', required: true },
  { name: 'ctl00$ContentPlaceHolder1$txtdob', id: 'ctl00_ContentPlaceHolder1_txtdob', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
  { name: 'ctl00$ContentPlaceHolder1$chkDecarationP', id: 'ctl00_ContentPlaceHolder1_chkDecarationP', type: 'checkbox', placeholder: 'I agree to the PAN declaration.', required: true },
];

const step2Fields = [
  { name: 'ctl00$ContentPlaceHolder1$txtAddress', id: 'ctl00_ContentPlaceHolder1_txtAddress', type: 'text', placeholder: 'Enter your address', required: true },
  { name: 'ctl00$ContentPlaceHolder1$txtPincode', id: 'ctl00_ContentPlaceHolder1_txtPincode', type: 'text', placeholder: 'Pincode', required: true },
  { name: 'ctl00$ContentPlaceHolder1$txtCity', id: 'ctl00_ContentPlaceHolder1_txtCity', type: 'text', placeholder: 'City', disabled: true },
  { name: 'ctl00$ContentPlaceHolder1$txtState', id: 'ctl00_ContentPlaceHolder1_txtState', type: 'text', placeholder: 'State', disabled: true },
];

export default function App() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(1);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const pincodeId = 'ctl00_ContentPlaceHolder1_txtPincode';

  const validateField = (id, value) => {
    let error = "";
    const currentStepFields = progress === 1 ? step1Fields : step2Fields;
    const field = currentStepFields.find(f => f.id === id);

    if (field && field.required) {
      if (!value || (field.type === "checkbox" && !value)) {
        error = `${field.placeholder || "This field"} is required.`;
      }
    }

    // Corrected logic: only validate the PAN number field, not the name field
    if (id === "ctl00_ContentPlaceHolder1_txtPan") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (value && !panRegex.test(value)) {
        error = "Invalid PAN format. Example: ABCDE1234F";
      }
    }
    
    setErrors((prev) => ({ ...prev, [id]: error }));
    return error;
  };

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    validateField(id, value);

    if (id.includes("txtPincode") && typeof value === "string" && value.length === 6) {
      setLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0].Status === "Success") {
            const { District, State } = data[0].PostOffice[0];
            setFormData((prev) => ({ 
              ...prev, 
              'ctl00_ContentPlaceHolder1_txtCity': District, 
              'ctl00_ContentPlaceHolder1_txtState': State 
            }));
            setErrors((prev) => ({ ...prev, [pincodeId]: "" }));
          } else {
            setFormData((prev) => ({ 
              ...prev, 
              'ctl00_ContentPlaceHolder1_txtCity': '', 
              'ctl00_ContentPlaceHolder1_txtState': '' 
            }));
            setErrors((prev) => ({ ...prev, [pincodeId]: "Invalid Pincode" }));
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setErrors((prev) => ({ ...prev, [pincodeId]: "Failed to fetch city/state." }));
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = {};
    let fieldsToValidate = progress === 1 ? step1Fields : step2Fields;
    let isValid = true;

    fieldsToValidate.forEach(field => {
      const value = field.type === "checkbox" ? !!formData[field.id] : formData[field.id];
      const specificError = validateField(field.id, value);
      if (specificError) {
        currentErrors[field.id] = specificError;
        isValid = false;
      }
    });

    setErrors(currentErrors);

    if (isValid) {
      if (progress === 1) {
        setProgress(2);
        setSubmissionMessage("");
        setErrors({});
      } else if (progress === 2) {
        // Submit to backend API
        setLoading(true);
        try {
          // Transform form data to match backend schema
          const apiData = {
            aadhaarNumber: formData['ctl00_ContentPlaceHolder1_txtadharno'],
            ownerName: formData['ctl00_ContentPlaceHolder1_txtownername'],
            aadhaarDeclaration: formData['ctl00_ContentPlaceHolder1_chkDecarationA'],
            panNumber: formData['ctl00_ContentPlaceHolder1_txtPan'],
            panName: formData['ctl00_ContentPlaceHolder1_txtPanName'],
            dateOfBirth: formData['ctl00_ContentPlaceHolder1_txtdob'],
            panDeclaration: formData['ctl00_ContentPlaceHolder1_chkDecarationP'],
            address: formData['ctl00_ContentPlaceHolder1_txtAddress'],
            pincode: formData['ctl00_ContentPlaceHolder1_txtPincode'],
            city: formData['ctl00_ContentPlaceHolder1_txtCity'],
            state: formData['ctl00_ContentPlaceHolder1_txtState']
          };

          const response = await fetch('http://localhost:5000/api/submit-form', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData)
          });

          const result = await response.json();

          if (result.success) {
            setSubmissionMessage(`✅ Form submitted successfully!\n\nSubmission ID: ${result.data.id}\nSubmitted at: ${new Date(result.data.submittedAt).toLocaleString()}`);
          } else {
            setSubmissionMessage(`❌ Submission failed:\n${result.errors ? result.errors.join('\n') : result.message}`);
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          setSubmissionMessage(`❌ Network error: ${error.message}\n\nPlease check if the backend server is running on http://localhost:5000`);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setSubmissionMessage("Please fix the errors before proceeding.");
    }
  };
  
  const currentFields = progress === 1 ? step1Fields : step2Fields;
  const isFinalStep = progress === 2;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Similar to official Udyam site */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">भारत</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय</h1>
                <p className="text-sm text-gray-600">Ministry of Micro, Small & Medium Enterprises</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              UDYAM REGISTRATION FORM
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center sm:justify-start space-x-4 sm:space-x-8 py-2 text-xs sm:text-sm">
            <a href="#" className="hover:text-blue-200 whitespace-nowrap">Home</a>
            <a href="#" className="hover:text-blue-200 whitespace-nowrap">NIC Code</a>
            <a href="#" className="hover:text-blue-200 whitespace-nowrap hidden sm:inline">Useful Documents</a>
            <a href="#" className="hover:text-blue-200 whitespace-nowrap hidden sm:inline">Print / Verify</a>
            <a href="#" className="hover:text-blue-200 whitespace-nowrap hidden sm:inline">Update Details</a>
            <a href="#" className="hover:text-blue-200 whitespace-nowrap">Login</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">
              {progress === 1 ? "Aadhaar & PAN Verification" : "Address Information"} - Step {progress} of 2
            </h2>
          </div>

          {/* Progress Tracker */}
          <div className="px-4 sm:px-6 py-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <div className={`flex-1 text-center font-semibold border-b-4 pb-2 transition-all duration-300 ${progress >= 1 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-400'}`}>
                <span className="hidden sm:inline">Step 1: Personal Details</span>
                <span className="sm:hidden">Step 1</span>
              </div>
              <div className={`flex-1 text-center font-semibold border-b-4 pb-2 transition-all duration-300 ${progress >= 2 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-400'}`}>
                <span className="hidden sm:inline">Step 2: Address Details</span>
                <span className="sm:hidden">Step 2</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              {currentFields.map((field, index) => (
                <div className="mb-6" key={index}>
                  {field.type !== "checkbox" && (
                    <>
                      <label htmlFor={field.id} className="block text-gray-700 text-sm font-semibold mb-2">
                        {index + 1}. {field.placeholder}{field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={field.type}
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ""}
                        disabled={field.disabled || loading}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors[field.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        style={{ fontSize: '14px' }}
                      />
                      {errors[field.id] && (
                        <p className="text-red-500 text-xs italic mt-2">{errors[field.id]}</p>
                      )}
                    </>
                  )}

                  {field.type === "checkbox" && (
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-md border">
                      <input
                        type="checkbox"
                        id={field.id}
                        checked={!!formData[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={field.id} className="block text-sm text-gray-900 leading-relaxed">
                        {field.placeholder}{field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                  )}
                </div>
              ))}

              {/* Instructions for Step 1 */}
              {progress === 1 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-semibold text-blue-800 mb-2">Important Instructions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Aadhaar number shall be required for Udyam Registration.</li>
                    <li>• The Aadhaar number shall be of the proprietor in the case of a proprietorship firm.</li>
                    <li>• PAN number must be in the format: ABCDE1234F</li>
                    <li>• Date of birth must be in DD/MM/YYYY format</li>
                  </ul>
                </div>
              )}

              {/* Instructions for Step 2 */}
              {progress === 2 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-semibold text-blue-800 mb-2">Address Information:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enter your complete address</li>
                    <li>• Pincode will automatically fetch city and state</li>
                    <li>• Ensure all address details are accurate</li>
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center sm:justify-end mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isFinalStep ? "Validate & Submit Form" : "Next Step"
                  )}
                </button>
              </div>
            </form>

            {/* Submission Message */}
            {submissionMessage && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                      {submissionMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
