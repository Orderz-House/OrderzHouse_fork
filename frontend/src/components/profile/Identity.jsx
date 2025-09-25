import { useState, useEffect } from "react";
import { toastError, toastSuccess } from "../../services/toastService";
import {
    Save,
    Upload,
    Eye,
    EyeOff,
    User,
    Mail,
    Phone,
    Globe,
    Camera,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Settings,
    Briefcase,
    FileText,
    CreditCard,
    UserCog,
    Lock
} from "lucide-react";
import Cookies from "js-cookie"
import axios from "axios";
import { useSelector } from "react-redux";

const Identity = () => {
    const {userData} = useSelector((state) => state.auth);
    const profileData = userData;
    const [identityData, setIdentityData] = useState({
        full_name: profileData.first_name + ' ' + profileData.last_name,
        contact_number: profileData.phone_number || '',
        id_number: '',
        address: ''
    });
    const [idDocument, setIdDocument] = useState(null);
    const [idErrors, setIdErrors] = useState({});

    const handleIdentityChange = (field, value) => {
        setIdentityData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (idErrors[field]) {
            setIdErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleIdDocumentUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toastError("File size must be less than 50MB");
                return;
            }
            setIdDocument(file);
        }
    };

    const handleIdentitySubmit = (e) => {
        e.preventDefault();
        // Add validation and submission logic here
        console.log("Identity data:", identityData, "Document:", idDocument);
        toastSuccess("Identity information updated successfully!");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Identity Information</h2>
            
            <form onSubmit={handleIdentitySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your name:
                        </label>
                        <input
                            type="text"
                            value={identityData.full_name}
                            onChange={(e) => handleIdentityChange('full_name', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact number:
                        </label>
                        <input
                            type="tel"
                            value={identityData.contact_number}
                            onChange={(e) => handleIdentityChange('contact_number', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Contact number"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        National identity card, passport or driving license number:
                    </label>
                    <input
                        type="text"
                        value={identityData.id_number}
                        onChange={(e) => handleIdentityChange('id_number', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="National identity card, passport or driving license number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add address:
                    </label>
                    <textarea
                        value={identityData.address}
                        onChange={(e) => handleIdentityChange('address', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Add address"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload identity document:
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Please upload your identity document here. Make sure your file size does not exceed 50MB.
                    </p>
                    
                    <label className="block">
                        <span className="sr-only">Choose identity document</span>
                        <input
                            type="file"
                            onChange={handleIdDocumentUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                        {idDocument ? idDocument.name : "No file chosen"}
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Save & Update
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                        Click "Save & Update" to update the latest changes
                    </p>
                </div>
            </form>
        </div>
    );
};


export default Identity;