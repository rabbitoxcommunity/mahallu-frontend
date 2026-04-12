import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileEdit, ShieldCheck, Users, Heart,
  IdCard, UsersRound, FileMinus, Home,
  FileText, Moon, School, Building2,
  Coins, Calculator, Key, FileCheck,
  ScrollText, FileX, Scale, GraduationCap,
  Wallet, FileSignature, Landmark, Banknote,
  BookOpen, Receipt, ClipboardList, MoonStar,
  BarChart, PieChart, IndianRupee, ListTodo,
  MessageSquare, Plane, Baby, FileSearch,
  Activity, CreditCard, Presentation
} from 'lucide-react';

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const dashboardItems = [
    { name: "മഹല്ല് സർവേ", icon: FileEdit, path: "#" },
    { name: "കുടുംബ വിവരങ്ങൾ", icon: ShieldCheck, path: "#" },
    { name: "അംഗങ്ങളുടെ വിവരങ്ങൾ", icon: Users, path: "#" },
    { name: "വിവാഹ തിയ്യതി രജിസ്റ്റർ", icon: Heart, path: "#" },
    { name: "വിവാഹ NOC രജിസ്റ്റർ", icon: IdCard, path: "#" },
    { name: "വിവാഹ രജിസ്റ്റർ", icon: UsersRound, path: "#" },
    { name: "മരണ രജിസ്റ്റർ", icon: FileMinus, path: "#" },
    { name: "ഭവന സഹായ രജിസ്റ്റർ", icon: Home, path: "#" },
    { name: "മഹല്ല് സർട്ടിഫിക്കറ്റ്", icon: FileText, path: "#" },
    { name: "മയ്യത്ത് പരിപാലന/രജിസ്റ്റർ", icon: Moon, path: "#" },
    { name: "മദ്രസ രജിസ്റ്റർ", icon: School, path: "#" },
    { name: "കെട്ടിട രജിസ്റ്റർ", icon: Building2, path: "#" },
    { name: "ഭവന നിർമ്മാണ ഫണ്ട്", icon: Coins, path: "#" },
    { name: "വരവ് ചിലവ് രജിസ്റ്റർ", icon: Calculator, path: "#" },
    { name: "വാടക (റൂം) രജിസ്റ്റർ", icon: Key, path: "#" },
    { name: "NOC സർട്ടിഫിക്കറ്റ്", icon: FileCheck, path: "#" },
    { name: "വിവാഹ സർട്ടിഫിക്കറ്റ്", icon: ScrollText, path: "#" },
    { name: "മരണ സർട്ടിഫിക്കറ്റ്", icon: FileX, path: "#" },
    { name: "വിവാഹ മോചന സർട്ടിഫിക്കറ്റ്", icon: Scale, path: "#" },
    { name: "വിടുതൽ സർട്ടിഫിക്കറ്റ്", icon: GraduationCap, path: "#" },
    { name: "മാസവരി/അംഗത്വ രജിസ്റ്റർ", icon: Wallet, path: "#" },
    { name: "മുത്തലാഖ് വിവരങ്ങൾ", icon: FileSignature, path: "#" },
    { name: "വഖഫ് സ്വത്ത് രജിസ്റ്റർ", icon: Landmark, path: "#" },
    { name: "ശമ്പള രജിസ്റ്റർ", icon: Banknote, path: "#" },
    { name: "ബാങ്ക് അക്കൗണ്ട് രജിസ്റ്റർ", icon: BookOpen, path: "#" },
    { name: "ബില്ലുകൾ", icon: Receipt, path: "#" },
    { name: "ഡെയിലി റിപ്പോർട്ടുകൾ", icon: ClipboardList, path: "#" },
    { name: "മസ്ജിദ് കണക്കുകൾ", icon: MoonStar, path: "#" },
    { name: "മാസ റിപ്പോർട്ടുകൾ", icon: BarChart, path: "#" },
    { name: "വാർഷിക റിപ്പോർട്ടുകൾ", icon: PieChart, path: "#" },
    { name: "കൂലി വരവ് ചിലവ്", icon: IndianRupee, path: "#" },
    { name: "പരാതികൾ / മീറ്റിംഗ് മിനുട്സ്", icon: ListTodo, path: "#" },
    { name: "എസ്.എം.എസ് സൗകര്യം", icon: MessageSquare, path: "#" },
    { name: "പ്രവാസി രജിസ്റ്റർ", icon: Plane, path: "#" },
    { name: "കമ്മിറ്റി മീറ്റിംഗ്", icon: Users, path: "#" },
    { name: "മദ്രസ വിദ്യാർത്ഥികൾ", icon: Baby, path: "#" },
    { name: "രജിസ്റ്റർ പരിശോധന", icon: FileSearch, path: "#" },
    { name: "മെഡിക്കൽ ഫണ്ട് റിപ്പോർട്ട്", icon: Activity, path: "#" },
    { name: "വരിസംഖ്യ വിവരങ്ങൾ", icon: CreditCard, path: "#" },
    { name: "മീറ്റിംഗ് റിപ്പോർട്ട്", icon: Presentation, path: "#" },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Select an option to manage records and details.</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
      >
        {dashboardItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Link
                to={item.path}
                className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl hover:shadow-xl hover:shadow-[#0B65F6]/5 hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="mb-4 p-4 bg-gray-50 dark:bg-[#252731] rounded-2xl group-hover:bg-[#0B65F6]/10 dark:group-hover:bg-[#0B65F6]/20 group-hover:scale-110 transition-all duration-300">
                  <Icon
                    size={32}
                    strokeWidth={1.5}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-[#0B65F6] dark:group-hover:text-[#0B65F6] transition-colors duration-300"
                  />
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-300 group-hover:text-[#0B65F6] dark:group-hover:text-[#0B65F6] line-clamp-2 leading-tight">
                  {item.name}
                </h3>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
