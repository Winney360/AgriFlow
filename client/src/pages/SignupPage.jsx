import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, MapPin, Phone, User, ShoppingBag, Sprout } from 'lucide-react';


// Sort countries alphabetically by label (A-Z regardless of continent)
const COUNTRY_CODE_OPTIONS = [
  { value: '+93', label: 'Afghanistan (+93)', placeholder: '70 123 4567' },
  { value: '+355', label: 'Albania (+355)', placeholder: '69 123 4567' },
  { value: '+213', label: 'Algeria (+213)', placeholder: '55 123 4567' },
  { value: '+376', label: 'Andorra (+376)', placeholder: '312 345' },
  { value: '+244', label: 'Angola (+244)', placeholder: '92 123 4567' },
  { value: '+1264', label: 'Anguilla (+1264)', placeholder: '234 5678' },
  { value: '+1268', label: 'Antigua (+1268)', placeholder: '123 4567' },
  { value: '+54', label: 'Argentina (+54)', placeholder: '11 1234 5678' },
  { value: '+374', label: 'Armenia (+374)', placeholder: '77 123 456' },
  { value: '+297', label: 'Aruba (+297)', placeholder: '560 1234' },
  { value: '+61', label: 'Australia (+61)', placeholder: '412 345 678' },
  { value: '+43', label: 'Austria (+43)', placeholder: '664 123456' },
  { value: '+994', label: 'Azerbaijan (+994)', placeholder: '50 123 4567' },
  { value: '+1242', label: 'Bahamas (+1242)', placeholder: '456 7890' },
  { value: '+973', label: 'Bahrain (+973)', placeholder: '36 123 456' },
  { value: '+880', label: 'Bangladesh (+880)', placeholder: '1712 345678' },
  { value: '+1246', label: 'Barbados (+1246)', placeholder: '234 5678' },
  { value: '+375', label: 'Belarus (+375)', placeholder: '29 123 4567' },
  { value: '+32', label: 'Belgium (+32)', placeholder: '475 12 34 56' },
  { value: '+501', label: 'Belize (+501)', placeholder: '612 3456' },
  { value: '+229', label: 'Benin (+229)', placeholder: '90 12 34 56' },
  { value: '+1441', label: 'Bermuda (+1441)', placeholder: '234 5678' },
  { value: '+975', label: 'Bhutan (+975)', placeholder: '17 123 456' },
  { value: '+591', label: 'Bolivia (+591)', placeholder: '712 34567' },
  { value: '+387', label: 'Bosnia (+387)', placeholder: '61 123 456' },
  { value: '+267', label: 'Botswana (+267)', placeholder: '71 123 456' },
  { value: '+55', label: 'Brazil (+55)', placeholder: '11 91234 5678' },
  { value: '+1284', label: 'British Virgin Is (+1284)', placeholder: '123 4567' },
  { value: '+673', label: 'Brunei (+673)', placeholder: '712 3456' },
  { value: '+359', label: 'Bulgaria (+359)', placeholder: '87 123 4567' },
  { value: '+226', label: 'Burkina Faso (+226)', placeholder: '70 12 34 56' },
  { value: '+257', label: 'Burundi (+257)', placeholder: '79 123 456' },
  { value: '+855', label: 'Cambodia (+855)', placeholder: '12 345 678' },
  { value: '+237', label: 'Cameroon (+237)', placeholder: '6 12 34 56 78' },
  { value: '+1', label: 'Canada (+1)', placeholder: '416 555 1234' },
  { value: '+238', label: 'Cape Verde (+238)', placeholder: '99 12 34' },
  { value: '+1345', label: 'Cayman Islands (+1345)', placeholder: '123 4567' },
  { value: '+236', label: 'Central African Rep. (+236)', placeholder: '70 12 34 56' },
  { value: '+235', label: 'Chad (+235)', placeholder: '90 12 34 56' },
  { value: '+56', label: 'Chile (+56)', placeholder: '9 1234 5678' },
  { value: '+86', label: 'China (+86)', placeholder: '131 2345 6789' },
  { value: '+57', label: 'Colombia (+57)', placeholder: '300 1234567' },
  { value: '+269', label: 'Comoros (+269)', placeholder: '34 12 345' },
  { value: '+242', label: 'Congo (+242)', placeholder: '06 123 4567' },
  { value: '+682', label: 'Cook Islands (+682)', placeholder: '71 234' },
  { value: '+506', label: 'Costa Rica (+506)', placeholder: '6123 4567' },
  { value: '+385', label: 'Croatia (+385)', placeholder: '91 234 5678' },
  { value: '+53', label: 'Cuba (+53)', placeholder: '7 1234567' },
  { value: '+357', label: 'Cyprus (+357)', placeholder: '96 123456' },
  { value: '+420', label: 'Czech Republic (+420)', placeholder: '601 234 567' },
  { value: '+45', label: 'Denmark (+45)', placeholder: '20 12 34 56' },
  { value: '+253', label: 'Djibouti (+253)', placeholder: '77 123 456' },
  { value: '+1767', label: 'Dominica (+1767)', placeholder: '123 4567' },
  { value: '+1809', label: 'Dominican Republic (+1809)', placeholder: '809 123 4567' },
  { value: '+593', label: 'Ecuador (+593)', placeholder: '99 123 4567' },
  { value: '+20', label: 'Egypt (+20)', placeholder: '10 1234 5678' },
  { value: '+503', label: 'El Salvador (+503)', placeholder: '7123 4567' },
  { value: '+240', label: 'Equatorial Guinea (+240)', placeholder: '22 212 3456' },
  { value: '+291', label: 'Eritrea (+291)', placeholder: '71 23 456' },
  { value: '+372', label: 'Estonia (+372)', placeholder: '5123 4567' },
  { value: '+268', label: 'Eswatini (+268)', placeholder: '76 123 456' },
  { value: '+251', label: 'Ethiopia (+251)', placeholder: '911 234 567' },
  { value: '+500', label: 'Falkland Islands (+500)', placeholder: '51234' },
  { value: '+298', label: 'Faroe Islands (+298)', placeholder: '212 345' },
  { value: '+679', label: 'Fiji (+679)', placeholder: '99 12345' },
  { value: '+358', label: 'Finland (+358)', placeholder: '40 123 4567' },
  { value: '+33', label: 'France (+33)', placeholder: '6 12 34 56 78' },
  { value: '+594', label: 'French Guiana (+594)', placeholder: '694 12 34 56' },
  { value: '+689', label: 'French Polynesia (+689)', placeholder: '87 12 34 56' },
  { value: '+241', label: 'Gabon (+241)', placeholder: '07 12 34 56' },
  { value: '+220', label: 'Gambia (+220)', placeholder: '99 123 45' },
  { value: '+995', label: 'Georgia (+995)', placeholder: '551 123 456' },
  { value: '+49', label: 'Germany (+49)', placeholder: '151 123 4567' },
  { value: '+233', label: 'Ghana (+233)', placeholder: '24 123 4567' },
  { value: '+350', label: 'Gibraltar (+350)', placeholder: '571 23456' },
  { value: '+30', label: 'Greece (+30)', placeholder: '691 234 5678' },
  { value: '+299', label: 'Greenland (+299)', placeholder: '22 34 56' },
  { value: '+1473', label: 'Grenada (+1473)', placeholder: '123 4567' },
  { value: '+590', label: 'Guadeloupe (+590)', placeholder: '690 12 34 56' },
  { value: '+1671', label: 'Guam (+1671)', placeholder: '789 1234' },
  { value: '+502', label: 'Guatemala (+502)', placeholder: '5123 4567' },
  { value: '+44', label: 'Guernsey (+44)', placeholder: '7781 123456' },
  { value: '+224', label: 'Guinea (+224)', placeholder: '62 123 4567' },
  { value: '+245', label: 'Guinea-Bissau (+245)', placeholder: '95 123 456' },
  { value: '+592', label: 'Guyana (+592)', placeholder: '612 3456' },
  { value: '+509', label: 'Haiti (+509)', placeholder: '34 12 3456' },
  { value: '+504', label: 'Honduras (+504)', placeholder: '9123 4567' },
  { value: '+852', label: 'Hong Kong (+852)', placeholder: '9123 4567' },
  { value: '+36', label: 'Hungary (+36)', placeholder: '30 123 4567' },
  { value: '+354', label: 'Iceland (+354)', placeholder: '611 1234' },
  { value: '+91', label: 'India (+91)', placeholder: '98765 43210' },
  { value: '+62', label: 'Indonesia (+62)', placeholder: '812 3456 7890' },
  { value: '+98', label: 'Iran (+98)', placeholder: '912 345 6789' },
  { value: '+964', label: 'Iraq (+964)', placeholder: '790 123 4567' },
  { value: '+353', label: 'Ireland (+353)', placeholder: '83 123 4567' },
  { value: '+44', label: 'Isle of Man (+44)', placeholder: '7624 123456' },
  { value: '+972', label: 'Israel (+972)', placeholder: '50 123 4567' },
  { value: '+39', label: 'Italy (+39)', placeholder: '312 123 4567' },
  { value: '+1876', label: 'Jamaica (+1876)', placeholder: '876 123 4567' },
  { value: '+81', label: 'Japan (+81)', placeholder: '90 1234 5678' },
  { value: '+44', label: 'Jersey (+44)', placeholder: '7797 123456' },
  { value: '+962', label: 'Jordan (+962)', placeholder: '79 123 4567' },
  { value: '+7', label: 'Kazakhstan (+7)', placeholder: '701 234 5678' },
  { value: '+254', label: 'Kenya (+254)', placeholder: '712 345 678' },
  { value: '+686', label: 'Kiribati (+686)', placeholder: '63 12345' },
  { value: '+383', label: 'Kosovo (+383)', placeholder: '44 123 456' },
  { value: '+965', label: 'Kuwait (+965)', placeholder: '5123 4567' },
  { value: '+996', label: 'Kyrgyzstan (+996)', placeholder: '550 123 456' },
  { value: '+856', label: 'Laos (+856)', placeholder: '20 23 456 789' },
  { value: '+371', label: 'Latvia (+371)', placeholder: '21 123 456' },
  { value: '+961', label: 'Lebanon (+961)', placeholder: '71 123 456' },
  { value: '+266', label: 'Lesotho (+266)', placeholder: '56 123 456' },
  { value: '+231', label: 'Liberia (+231)', placeholder: '77 123 4567' },
  { value: '+218', label: 'Libya (+218)', placeholder: '91 234 5678' },
  { value: '+423', label: 'Liechtenstein (+423)', placeholder: '234 5678' },
  { value: '+370', label: 'Lithuania (+370)', placeholder: '612 34567' },
  { value: '+352', label: 'Luxembourg (+352)', placeholder: '621 123 456' },
  { value: '+853', label: 'Macau (+853)', placeholder: '6612 3456' },
  { value: '+389', label: 'Macedonia (+389)', placeholder: '70 123 456' },
  { value: '+261', label: 'Madagascar (+261)', placeholder: '32 12 345 67' },
  { value: '+265', label: 'Malawi (+265)', placeholder: '88 123 4567' },
  { value: '+60', label: 'Malaysia (+60)', placeholder: '12 345 6789' },
  { value: '+960', label: 'Maldives (+960)', placeholder: '712 3456' },
  { value: '+223', label: 'Mali (+223)', placeholder: '70 12 34 56' },
  { value: '+356', label: 'Malta (+356)', placeholder: '79 123 456' },
  { value: '+692', label: 'Marshall Islands (+692)', placeholder: '456 1234' },
  { value: '+596', label: 'Martinique (+596)', placeholder: '696 12 34 56' },
  { value: '+222', label: 'Mauritania (+222)', placeholder: '46 12 34 56' },
  { value: '+230', label: 'Mauritius (+230)', placeholder: '52 123 456' },
  { value: '+262', label: 'Mayotte (+262)', placeholder: '639 12 34 56' },
  { value: '+52', label: 'Mexico (+52)', placeholder: '55 1234 5678' },
  { value: '+691', label: 'Micronesia (+691)', placeholder: '345 1234' },
  { value: '+373', label: 'Moldova (+373)', placeholder: '79 123 456' },
  { value: '+377', label: 'Monaco (+377)', placeholder: '61 23 45 67' },
  { value: '+976', label: 'Mongolia (+976)', placeholder: '88 123 456' },
  { value: '+382', label: 'Montenegro (+382)', placeholder: '69 123 456' },
  { value: '+1664', label: 'Montserrat (+1664)', placeholder: '123 4567' },
  { value: '+212', label: 'Morocco (+212)', placeholder: '6 12 345678' },
  { value: '+258', label: 'Mozambique (+258)', placeholder: '82 123 4567' },
  { value: '+95', label: 'Myanmar (+95)', placeholder: '92 123 4567' },
  { value: '+264', label: 'Namibia (+264)', placeholder: '81 123 4567' },
  { value: '+674', label: 'Nauru (+674)', placeholder: '555 1234' },
  { value: '+977', label: 'Nepal (+977)', placeholder: '984 1234567' },
  { value: '+31', label: 'Netherlands (+31)', placeholder: '6 12345678' },
  { value: '+687', label: 'New Caledonia (+687)', placeholder: '76 12 34 56' },
  { value: '+64', label: 'New Zealand (+64)', placeholder: '21 123 4567' },
  { value: '+505', label: 'Nicaragua (+505)', placeholder: '8123 4567' },
  { value: '+227', label: 'Niger (+227)', placeholder: '90 12 34 56' },
  { value: '+234', label: 'Nigeria (+234)', placeholder: '802 123 4567' },
  { value: '+683', label: 'Niue (+683)', placeholder: '4123' },
  { value: '+672', label: 'Norfolk Island (+672)', placeholder: '38 123' },
  { value: '+1670', label: 'Northern Mariana Is (+1670)', placeholder: '123 4567' },
  { value: '+47', label: 'Norway (+47)', placeholder: '412 34 567' },
  { value: '+968', label: 'Oman (+968)', placeholder: '9212 3456' },
  { value: '+92', label: 'Pakistan (+92)', placeholder: '321 1234567' },
  { value: '+680', label: 'Palau (+680)', placeholder: '123 4567' },
  { value: '+970', label: 'Palestine (+970)', placeholder: '59 123 4567' },
  { value: '+507', label: 'Panama (+507)', placeholder: '6123 4567' },
  { value: '+675', label: 'Papua New Guinea (+675)', placeholder: '71 123 456' },
  { value: '+595', label: 'Paraguay (+595)', placeholder: '961 123456' },
  { value: '+51', label: 'Peru (+51)', placeholder: '912 345 678' },
  { value: '+63', label: 'Philippines (+63)', placeholder: '912 345 6789' },
  { value: '+64', label: 'Pitcairn Islands (+64)', placeholder: '123 4567' },
  { value: '+48', label: 'Poland (+48)', placeholder: '501 123 456' },
  { value: '+351', label: 'Portugal (+351)', placeholder: '912 345 678' },
  { value: '+1787', label: 'Puerto Rico (+1787)', placeholder: '123 4567' },
  { value: '+974', label: 'Qatar (+974)', placeholder: '3312 3456' },
  { value: '+262', label: 'Réunion (+262)', placeholder: '692 12 34 56' },
  { value: '+40', label: 'Romania (+40)', placeholder: '712 345 678' },
  { value: '+7', label: 'Russia (+7)', placeholder: '912 345 6789' },
  { value: '+250', label: 'Rwanda (+250)', placeholder: '788 123 456' },
  { value: '+590', label: 'Saint Barthélemy (+590)', placeholder: '690 12 34 56' },
  { value: '+290', label: 'Saint Helena (+290)', placeholder: '5 1234' },
  { value: '+1869', label: 'Saint Kitts (+1869)', placeholder: '123 4567' },
  { value: '+1758', label: 'Saint Lucia (+1758)', placeholder: '123 4567' },
  { value: '+590', label: 'Saint Martin (+590)', placeholder: '690 12 34 56' },
  { value: '+508', label: 'Saint Pierre (+508)', placeholder: '55 12 34' },
  { value: '+1784', label: 'Saint Vincent (+1784)', placeholder: '123 4567' },
  { value: '+685', label: 'Samoa (+685)', placeholder: '72 12345' },
  { value: '+378', label: 'San Marino (+378)', placeholder: '66 12 3456' },
  { value: '+239', label: 'São Tomé (+239)', placeholder: '90 123 45' },
  { value: '+966', label: 'Saudi Arabia (+966)', placeholder: '50 123 4567' },
  { value: '+221', label: 'Senegal (+221)', placeholder: '77 123 45 67' },
  { value: '+381', label: 'Serbia (+381)', placeholder: '64 123 4567' },
  { value: '+248', label: 'Seychelles (+248)', placeholder: '25 12 345' },
  { value: '+232', label: 'Sierra Leone (+232)', placeholder: '30 123 456' },
  { value: '+65', label: 'Singapore (+65)', placeholder: '9123 4567' },
  { value: '+1721', label: 'Sint Maarten (+1721)', placeholder: '123 4567' },
  { value: '+421', label: 'Slovakia (+421)', placeholder: '905 123 456' },
  { value: '+386', label: 'Slovenia (+386)', placeholder: '31 123 456' },
  { value: '+677', label: 'Solomon Islands (+677)', placeholder: '74 12345' },
  { value: '+252', label: 'Somalia (+252)', placeholder: '61 234 567' },
  { value: '+27', label: 'South Africa (+27)', placeholder: '71 234 5678' },
  { value: '+211', label: 'South Sudan (+211)', placeholder: '912 345 678' },
  { value: '+34', label: 'Spain (+34)', placeholder: '612 345 678' },
  { value: '+94', label: 'Sri Lanka (+94)', placeholder: '71 234 5678' },
  { value: '+249', label: 'Sudan (+249)', placeholder: '91 234 5678' },
  { value: '+597', label: 'Suriname (+597)', placeholder: '712 3456' },
  { value: '+47', label: 'Svalbard (+47)', placeholder: '412 34 567' },
  { value: '+46', label: 'Sweden (+46)', placeholder: '70 123 45 67' },
  { value: '+41', label: 'Switzerland (+41)', placeholder: '79 123 45 67' },
  { value: '+963', label: 'Syria (+963)', placeholder: '94 123 456' },
  { value: '+886', label: 'Taiwan (+886)', placeholder: '912 345 678' },
  { value: '+992', label: 'Tajikistan (+992)', placeholder: '90 123 4567' },
  { value: '+255', label: 'Tanzania (+255)', placeholder: '712 345 678' },
  { value: '+66', label: 'Thailand (+66)', placeholder: '81 234 5678' },
  { value: '+670', label: 'Timor-Leste (+670)', placeholder: '7723 4567' },
  { value: '+228', label: 'Togo (+228)', placeholder: '90 12 34 56' },
  { value: '+690', label: 'Tokelau (+690)', placeholder: '2123' },
  { value: '+676', label: 'Tonga (+676)', placeholder: '77 12345' },
  { value: '+1868', label: 'Trinidad & Tobago (+1868)', placeholder: '868 123 4567' },
  { value: '+216', label: 'Tunisia (+216)', placeholder: '20 123 456' },
  { value: '+90', label: 'Turkey (+90)', placeholder: '532 123 4567' },
  { value: '+993', label: 'Turkmenistan (+993)', placeholder: '65 123456' },
  { value: '+1649', label: 'Turks & Caicos (+1649)', placeholder: '123 4567' },
  { value: '+688', label: 'Tuvalu (+688)', placeholder: '90 123' },
  { value: '+256', label: 'Uganda (+256)', placeholder: '772 123 456' },
  { value: '+380', label: 'Ukraine (+380)', placeholder: '50 123 4567' },
  { value: '+971', label: 'UAE (+971)', placeholder: '50 123 4567' },
  { value: '+44', label: 'UK (+44)', placeholder: '7911 123456' },
  { value: '+598', label: 'Uruguay (+598)', placeholder: '91 234 567' },
  { value: '+1', label: 'USA (+1)', placeholder: '212 555 1234' },
  { value: '+998', label: 'Uzbekistan (+998)', placeholder: '90 123 4567' },
  { value: '+678', label: 'Vanuatu (+678)', placeholder: '77 12345' },
  { value: '+58', label: 'Venezuela (+58)', placeholder: '412 1234567' },
  { value: '+84', label: 'Vietnam (+84)', placeholder: '91 234 5678' },
  { value: '+1284', label: 'Virgin Islands (+1284)', placeholder: '123 4567' },
  { value: '+681', label: 'Wallis & Futuna (+681)', placeholder: '82 12 34' },
  { value: '+212', label: 'Western Sahara (+212)', placeholder: '6 12 345678' },
  { value: '+967', label: 'Yemen (+967)', placeholder: '77 123 4567' },
  { value: '+260', label: 'Zambia (+260)', placeholder: '95 123 4567' },
  { value: '+263', label: 'Zimbabwe (+263)', placeholder: '77 123 4567' },
].sort((a, b) => a.label.localeCompare(b.label));
const getNumberPlaceholder = (countryCode) => {
  const option = COUNTRY_CODE_OPTIONS.find((option) => option.value === countryCode);
  return option?.placeholder || '712 345 678';
};

const buildFullPhoneNumber = (countryCode, localPhoneNumber) => {
  const cleaned = String(localPhoneNumber || '').replace(/\D/g, '');
  const normalizedLocal = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `${countryCode}${normalizedLocal}`;
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signupPending, setSignupPending] = useState(false);
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    countryCode: '+254',
    localPhoneNumber: '',
    password: '',
    email: '',
    locationName: '',
    role: 'buyer',
  });

  // On mount, check for ?role=buyer or ?role=seller and set role accordingly
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'buyer' || roleParam === 'seller')) {
      setForm((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.localPhoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    const composedPhoneNumber = buildFullPhoneNumber(form.countryCode, form.localPhoneNumber);
    if (!composedPhoneNumber || composedPhoneNumber.length < 8) {
      setError('Enter a valid phone number');
      return;
    }

    if (!form.password.trim()) {
      setError('Password is required');
      return;
    }

    if (!form.locationName.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setSignupPending(true);
      const payload = {
        name: form.name,
        phoneNumber: composedPhoneNumber,
        password: form.password,
        email: form.email,
        locationName: form.locationName,
        role: form.role,
      };
      // Log payload for debugging mobile issues
      if (typeof window !== 'undefined' && window.console) {
        console.log('Signup payload:', payload);
      }
      const user = await signup(payload);
      const redirectUrl = user.role === 'seller' ? '/dashboard' : '/marketplace';
      navigate(redirectUrl);
    } catch (err) {
      // Show the most detailed error possible
      let message = 'Failed to create account';
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      // Log error for debugging
      if (typeof window !== 'undefined' && window.console) {
        console.error('Signup error:', err);
      }
    } finally {
      setSignupPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
      <div className="w-full max-w-87.5 xs:max-w-[380px] sm:max-w-105 md:max-w-120 lg:max-w-130 rounded-xl border border-[#d8ddda] bg-white shadow-sm mx-auto">
        <form onSubmit={onSubmit} className="space-y-5 px-3 py-5 xs:px-4 sm:px-6 sm:py-6 md:space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-[#20a46b] leading-tight">
              Create your AgriFlow account.
            </h1>
            <p className="text-xs xs:text-sm text-[#666] leading-relaxed">
              Sign up with your details to start buying or selling locally.
            </p>
          </div>

          {/* Role Selection - Horizontal on all screens */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              I want to
            </label>
            <div className="flex flex-row gap-2 sm:gap-3">
              <label 
                className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-2.5 sm:p-3 transition-all hover:border-[#20a46b] hover:bg-[#f0fdf6]" 
                style={{
                  borderColor: form.role === 'buyer' ? '#20a46b' : '#d0d6d2',
                  backgroundColor: form.role === 'buyer' ? '#f0fdf6' : '#fff'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={form.role === 'buyer'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="accent-[#20a46b] w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ShoppingBag size={16} className="text-[#20a46b] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#333]">Buy</span>
                </div>
              </label>
              
              <label 
                className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-2.5 sm:p-3 transition-all hover:border-[#20a46b] hover:bg-[#f0fdf6]" 
                style={{
                  borderColor: form.role === 'seller' ? '#20a46b' : '#d0d6d2',
                  backgroundColor: form.role === 'seller' ? '#f0fdf6' : '#fff'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={form.role === 'seller'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="accent-[#20a46b] w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sprout size={16} className="text-[#20a46b] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#333]">Sell</span>
                </div>
              </label>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <User size={16} className="text-[#999] shrink-0" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none px-2 py-2 placeholder:text-[#999]"
                required
              />
            </div>
          </div>

          {/* Phone Number Field - 3/8 and 5/8 split */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-row items-stretch gap-2">
              {/* Country Code Dropdown - 3/8 width */}
              <div className="w-3/8 flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
                <Phone size={16} className="text-[#999] shrink-0" />
                <select
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="ml-2 w-full h-4 rounded-md border-0 bg-transparent px-1 text-xs font-medium text-[#2b4f42] outline-none cursor-pointer hover:text-[#20a46b] focus:text-[#20a46b] transition-colors"
                  aria-label="Select country code"
                  size="1"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#20a46b #f0fdf6'
                  }}
                >
                  {COUNTRY_CODE_OPTIONS.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="py-2 hover:bg-[#20a46b] hover:text-white focus:bg-[#20a46b] focus:text-white"
                      style={{
                        backgroundColor: form.countryCode === option.value ? '#f0fdf6' : 'transparent',
                        color: form.countryCode === option.value ? '#20a46b' : 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#20a46b';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        if (form.countryCode !== option.value) {
                          e.target.style.backgroundColor = '';
                          e.target.style.color = '';
                        } else {
                          e.target.style.backgroundColor = '#f0fdf6';
                          e.target.style.color = '#20a46b';
                        }
                      }}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Phone Number Input - 5/8 width */}
              <div className="w-5/8 flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={getNumberPlaceholder(form.countryCode)}
                  value={form.localPhoneNumber}
                  onChange={(e) => setForm({ ...form, localPhoneNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-transparent text-xs sm:text-sm outline-none px-1 placeholder:text-[#999]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (min. 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-[#999]"
                minLength="6"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#999] hover:text-[#20a46b] transition-colors p-1 shrink-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Email Field - Still Optional */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Email <span className="font-normal text-[#999]">(Optional)</span>
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <Mail size={16} className="text-[#999] shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none px-2 py-2 placeholder:text-[#999]"
              />
            </div>
          </div>

          {/* Location Field - Now Required */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <MapPin size={16} className="text-[#999] shrink-0" />
              <input
                type="text"
                placeholder="Enter your town / city"
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none px-2 py-2 placeholder:text-[#999]"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={signupPending}
            className="w-full rounded-lg bg-[#20a46b] py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#1a8657] disabled:bg-[#a3d8b9] disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {signupPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Login Link */}
          <div className="border-t border-[#e0e5e1] pt-4 sm:pt-5 text-center">
            <p className="text-xs sm:text-sm text-[#666]">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-[#20a46b] hover:text-[#1a8657] hover:underline transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};