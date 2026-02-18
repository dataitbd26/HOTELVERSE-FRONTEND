import EmailAccountSettings from "../../components/Setup/EmailAccountSettings";
import EmailTemplateList from "../../components/Setup/EmailTemplateList";



const EmailAccount = () => {

    return (

     <div className="min-h-screen bg-gray-50 p-3 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <EmailAccountSettings />
        <EmailTemplateList />
      </div>
    </div>
    );
};

export default EmailAccount;