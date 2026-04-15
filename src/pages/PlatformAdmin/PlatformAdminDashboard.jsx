import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Users, Settings, BarChart3, Plus, Shield } from 'lucide-react';

export default function PlatformAdminDashboard() {
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
    { 
      name: "Create Tenant", 
      icon: Plus, 
      path: "/platform-admin/tenants/create",
      description: "Create a new tenant organization"
    },
    { 
      name: "View Tenants", 
      icon: Building2, 
      path: "/platform-admin/tenants",
      description: "Manage all tenant organizations"
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your multi-tenant SaaS platform</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {dashboardItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Link
                to={item.path}
                className="group flex flex-col p-6 bg-white dark:bg-[#1e1f25] border border-gray-100 dark:border-gray-800/60 rounded-2xl hover:shadow-xl hover:shadow-[#0B65F6]/5 hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="mb-4 p-4 bg-gray-50 dark:bg-[#252731] rounded-2xl group-hover:bg-[#0B65F6]/10 dark:group-hover:bg-[#0B65F6]/20 group-hover:scale-110 transition-all duration-300 w-fit">
                  <Icon
                    size={32}
                    strokeWidth={1.5}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-[#0B65F6] dark:group-hover:text-[#0B65F6] transition-colors duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#0B65F6] dark:group-hover:text-[#0B65F6] mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
