import { AppShell } from '../components/Shell';
import { AboutBlock, ContactBlock, FaqBlock } from '../components/Sections';

export const FaqPage = () => (<AppShell on="faq"><h1>FAQ</h1><br /><FaqBlock /></AppShell>);
export const ContactPage = () => (<AppShell on="contact"><h1>Contact</h1><br /><ContactBlock /></AppShell>);
export const AboutPage = () => (<AppShell on="about"><h1>About</h1><br /><AboutBlock /></AppShell>);
