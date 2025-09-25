import { useState, useEffect } from "react";
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
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Billing = () => {
    const {userData} = useSelector((state) => state.auth);
    const profileData = userData
    const [billingData, setBillingData] = useState({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        company_title: '',
        country: profileData.country || 'Jordan',
        states: '',
        city: '',
        address: '',
        postal_code: '',
        email: profileData.email || '',
        phone: profileData.phone_number || ''
    });
    const [billingErrors, setBillingErrors] = useState({});

    const handleBillingChange = (field, value) => {
        setBillingData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (billingErrors[field]) {
            setBillingErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleBillingSubmit = (e) => {
        e.preventDefault();
        console.log("Billing data:", billingData);
        toast.success("Billing information updated successfully!");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            <form onSubmit={handleBillingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First name:
                        </label>
                        <input
                            type="text"
                            value={billingData.first_name}
                            onChange={(e) => handleBillingChange('first_name', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter first name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last name:
                        </label>
                        <input
                            type="text"
                            value={billingData.last_name}
                            onChange={(e) => handleBillingChange('last_name', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter last name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company title:
                    </label>
                    <input
                        type="text"
                        value={billingData.company_title}
                        onChange={(e) => handleBillingChange('company_title', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your company title"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country:
                        </label>
                        <select
                            value={billingData.country}
                            onChange={(e) => handleBillingChange('country', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Jordan">Jordan</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Australia">Australia</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            States:
                        </label>
                        <input
                            type="text"
                            value={billingData.states}
                            onChange={(e) => handleBillingChange('states', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="States"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City:
                        </label>
                        <input
                            type="text"
                            value={billingData.city}
                            onChange={(e) => handleBillingChange('city', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter city"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal code:
                        </label>
                        <input
                            type="text"
                            value={billingData.postal_code}
                            onChange={(e) => handleBillingChange('postal_code', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter postal code"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address:
                    </label>
                    <textarea
                        value={billingData.address}
                        onChange={(e) => handleBillingChange('address', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Enter address"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email:
                        </label>
                        <input
                            type="email"
                            value={billingData.email}
                            onChange={(e) => handleBillingChange('email', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone:
                        </label>
                        <input
                            type="tel"
                            value={billingData.phone}
                            onChange={(e) => handleBillingChange('phone', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter phone"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Update settings
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                        Click "Update settings" to update the latest changes made by you
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Billing;
