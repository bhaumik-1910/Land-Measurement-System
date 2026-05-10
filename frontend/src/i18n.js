import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "home": "Home",
      "my_records": "My Records",
      "measure_land": "Measure Land",
      "admin_panel": "Admin Panel",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "ai_insights": "AI Smart Agriculture Insights",
      "export_pdf": "Export PDF",
      "back": "Back",
      "dashboard": "Dashboard",
      "suitability": "Suitability",
      "measured_on": "Measured on",
      "report_id": "Report ID",
      "official_report": "Official Survey Report",
      "status": "Status",
      "property_specs": "Property Specifications",
      "area": "Area",
      "points": "Points",
      "surveyor": "Surveyor",
      "method": "Method",
      "description": "Description",
      "related_docs": "Related Documents",
      "boundary_gps": "Boundary GPS Coordinates",
      "marker": "Marker",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "contact_details": "Contact Details",
      "address": "Ahmedabad, Gujarat 380058",
      "verify_qr": "Scan to Verify Record",
      "ai_crop_tip": "AI Crop Suggestion",
      "ai_crop_desc": "Based on your land area and location, here are the best crops to grow.",
      "about_us": "About Us",
      "privacy_policy": "Privacy Policy",
      "our_mission": "Our Mission",
      "our_vision": "Our Vision",
      "core_values": "Our Core Values",
      "accuracy": "Measurement Accuracy",
      "verified_records": "Verified Records",
      "get_started": "Get Started",
      "contact_support": "Contact Support",
      "feat_polygon": "Polygon Mapping",
      "feat_polygon_desc": "Draw accurate boundaries on high-resolution satellite maps with real-time area calculation.",
      "feat_gps": "GPS Walk-Through",
      "feat_gps_desc": "Switch to mobile mode and walk along the boundary to automatically capture coordinates via GPS.",
      "feat_unit": "Unit Conversion",
      "feat_unit_desc": "Seamlessly switch between Sq.Ft, Sq.Meter, Acres, and Hectares with instant conversion."
    }
  },
  gu: {
    translation: {
      "home": "હોમ",
      "my_records": "મારા રેકોર્ડ્સ",
      "measure_land": "જમીન માપો",
      "admin_panel": "એડમિન પેનલ",
      "login": "લોગિન",
      "register": "રજીસ્ટ્રેશન",
      "logout": "લોગઆઉટ",
      "ai_insights": "AI સ્માર્ટ ખેતી સલાહ",
      "export_pdf": "PDF ડાઉનલોડ કરો",
      "back": "પાછા જાઓ",
      "dashboard": "ડેશબોર્ડ",
      "suitability": "અનુકૂળતા",
      "measured_on": "માપણી તારીખ",
      "report_id": "રિપોર્ટ ID",
      "official_report": "સત્તાવાર સર્વે રિપોર્ટ",
      "status": "સ્થિતિ",
      "property_specs": "જમીનની વિગતો",
      "area": "વિસ્તાર",
      "points": "પોઈન્ટ્સ",
      "surveyor": "સર્વેયર",
      "method": "પદ્ધતિ",
      "description": "વર્ણન",
      "related_docs": "સંબંધિત દસ્તાવેજો",
      "boundary_gps": "સીમા GPS કોઓર્ડિનેટ્સ",
      "marker": "માર્કર",
      "latitude": "અક્ષાંશ",
      "longitude": "રેખાંશ",
      "contact_details": "સંપર્ક વિગતો",
      "address": "અમદાવાદ, ગુજરાત ૩૮૦૦૫૮",
      "verify_qr": "રેકોર્ડ વેરિફાઈ કરવા સ્કેન કરો",
      "ai_crop_tip": "AI પાક સૂચન",
      "ai_crop_desc": "તમારી જમીન અને વિસ્તાર મુજબ, આ પાક લેવા શ્રેષ્ઠ રહેશે.",
      "about_us": "અમારા વિશે",
      "privacy_policy": "પ્રાઈવસી પોલિસી",
      "our_mission": "અમારું લક્ષ્ય",
      "our_vision": "અમારું વિઝન",
      "core_values": "અમારા મુખ્ય મૂલ્યો",
      "accuracy": "માપણી ચોકસાઈ",
      "verified_records": "વેરિફાઈડ રેકોર્ડ્સ",
      "get_started": "શરૂ કરો",
      "contact_support": "સપોર્ટનો સંપર્ક કરો",
      "feat_polygon": "પોલીગોન મેપિંગ",
      "feat_polygon_desc": "હાઇ-રિઝોલ્યુશન સેટેલાઇટ મેપ પર સચોટ સીમાઓ દોરો અને રિયલ-ટાઇમમાં વિસ્તાર ગણો.",
      "feat_gps": "GPS વોક-થ્રુ",
      "feat_gps_desc": "GPS દ્વારા આપમેળે કોઓર્ડિનેટ્સ કેપ્ચર કરવા માટે સીમા પર ચાલો.",
      "feat_unit": "યુનિટ કન્વર્ઝન",
      "feat_unit_desc": "ચોરસ ફૂટ, ચોરસ મીટર, એકર અને હેક્ટર વચ્ચે સરળતાથી સ્વિચ કરો."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
