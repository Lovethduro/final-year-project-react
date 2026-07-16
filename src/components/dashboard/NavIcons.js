import {
    FaTachometerAlt,
    FaDollarSign,
    FaUsers,
    FaBullseye,
    FaTicketAlt,
    FaHeadset,
    FaComments,
    FaCreditCard,
    FaShoppingBag,
    FaFire,
    FaChartBar,
    FaCommentDots,
    FaTrophy,
    FaBook,
    FaUserPlus,
    FaUserShield,
    FaFileAlt,
    FaDatabase,
    FaLock,
    FaCog,
    FaHeartbeat,
    FaUser,
    FaBookOpen,
} from 'react-icons/fa';

const icons = {
    dashboard: FaTachometerAlt,
    sales: FaDollarSign,
    customers: FaUsers,
    leads: FaBullseye,
    tickets: FaTicketAlt,
    support: FaHeadset,
    messages: FaComments,
    billing: FaCreditCard,
    products: FaShoppingBag,
    deals: FaFire,
    analytics: FaChartBar,
    feedback: FaCommentDots,
    performance: FaTrophy,
    knowledge: FaBook,
    users: FaUserPlus,
    roles: FaUserShield,
    compliance: FaFileAlt,
    data: FaDatabase,
    security: FaLock,
    config: FaCog,
    health: FaHeartbeat,
    profile: FaUser,
    playbook: FaBookOpen,
};

export function NavIcon({ name, size = 16 }) {
    const Icon = icons[name];
    if (!Icon) return null;
    return <Icon size={size} aria-hidden="true" />;
}
