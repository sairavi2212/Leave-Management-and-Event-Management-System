import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState("about");
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header/Navigation */}
            <header className="bg-zinc-900 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-o7JmMLlVpnVAOrG6fB-9Zo-Y5NsvIVpiAA&s"
                            alt="Eklavya Foundation Logo"
                            className="h-12 w-auto mr-4"
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/200x80?text=Eklavya+Foundation";
                            }}
                        />
                        <h1 className="text-2xl font-bold text-white">Eklavya Foundation</h1>
                    </div>
                    <nav className="hidden md:flex space-x-10">
                        <button
                            onClick={() => setActiveTab("about")}
                            className={`text-base font-medium ${activeTab === "about" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
                        >
                            About Us
                        </button>
                        <button
                            onClick={() => setActiveTab("programs")}
                            className={`text-base font-medium ${activeTab === "programs" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
                        >
                            Our Programs
                        </button>
                        {/* <button
                            onClick={() => setActiveTab("donate")}
                            className={`text-base font-medium ${activeTab === "donate" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
                        >
                            Donate
                        </button> */}
                        {/* <button
                            onClick={() => setActiveTab("contact")}
                            className={`text-base font-medium ${activeTab === "contact" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
                        >
                            Contact
                        </button> */}
                    </nav>
                    <div>
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('./login')} 
                            className="mr-2 border-gray-600 text-gray-800 hover:bg-gray-800 hover:text-white"
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            {activeTab !== "login" && (
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
                    <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Empowering Through Education</h1>
                        <p className="mt-6 max-w-3xl text-xl text-blue-100">
                            Eklavya Foundation is dedicated to transforming lives through quality education,
                            skill development, and community empowerment initiatives across India.
                        </p>
                        <div className="mt-10">
                            {/* <Button
                                onClick={() => setActiveTab("donate")}
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-blue-50 mr-4"
                            >
                                Donate Now
                            </Button> */}
                            <Button
                                onClick={() => setActiveTab("programs")}
                                size="lg"
                                variant="outline"
                                className="border-white text-black hover:bg-white/20 hover:border-blue-400"
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {activeTab === "about" && (
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">About Eklavya Foundation</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <p className="text-lg text-gray-300 mb-6">
                                    Eklavya Foundation has been a pioneer in innovative education for over 20 years, developing curriculum materials, improving school functioning, and training teachers across India.
                                </p>
                                <p className="text-lg text-gray-300 mb-6">
                                    Our major strengths lie in five distinct areas:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-lg text-gray-300 mb-6">
                                    <li>Developing curricular materials for all levels of schooling</li>
                                    <li>Improving the all-round functioning of schools</li>
                                    <li>Training teachers to become more innovative educators</li>
                                    <li>Working with communities to develop need-related educational programs</li>
                                    <li>Publishing teaching-learning and educational materials</li>
                                </ul>
                                <p className="text-lg text-gray-300 mb-6">
                                    With operational education resource centers across multiple locations in India, we serve as a key resource agency providing support and guidance to both government and civil society educational organizations.
                                </p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg overflow-hidden">
                                <img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-o7JmMLlVpnVAOrG6fB-9Zo-Y5NsvIVpiAA&s"
                                    alt="Eklavya Foundation"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/800x600?text=Eklavya+Foundation";
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === "programs" && (
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">Our Programs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="bg-zinc-800 border-zinc-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Education Initiatives</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-300">
                                    <p>Supporting schools, providing learning materials, and organizing educational workshops for children from underserved communities.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-800 border-zinc-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Skill Development</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-300">
                                    <p>Vocational training programs for youth and adults to enhance employability and promote self-reliance.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-800 border-zinc-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Community Empowerment</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-300">
                                    <p>Initiatives focused on health awareness, environmental conservation, and promoting civic responsibility.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                )}

                {activeTab === "donate" && (
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">Support Our Cause</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <p className="text-lg text-gray-300 mb-6">
                                    Your generous contributions help us continue our mission of providing quality education
                                    and development opportunities to those who need it most.
                                </p>
                                <p className="text-lg text-gray-300 mb-6">
                                    Every donation, regardless of size, makes a significant impact in transforming lives.
                                </p>
                                <div className="flex flex-col space-y-4">
                                    <Button size="lg">Donate Now</Button>
                                    <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800">
                                        Become a Monthly Supporter
                                    </Button>
                                </div>
                            </div>
                            <Card className="bg-zinc-800 border-zinc-700">
                                <CardHeader>
                                    <CardTitle className="text-white">How Your Donation Helps</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-300">
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>₹1,000 provides educational materials for one child for a month</li>
                                        <li>₹5,000 supports a teacher's salary for a week</li>
                                        <li>₹10,000 equips a rural learning center with basic infrastructure</li>
                                        <li>₹25,000 funds vocational training for five youth</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                )}

                {activeTab === "contact" && (
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">Contact Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
                                <form className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                                        <Input id="name" placeholder="Your Name" className="bg-zinc-900 border-zinc-700 text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                        <Input id="email" type="email" placeholder="your.email@example.com" className="bg-zinc-900 border-zinc-700 text-white" />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                                        <textarea
                                            id="message"
                                            rows={4}
                                            className="mt-1 block w-full rounded-md bg-zinc-900 border-zinc-700 text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="How can we help you?"
                                        />
                                    </div>
                                    <Button type="submit">Send Message</Button>
                                </form>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Our Office</h3>
                                <p className="text-gray-300 mb-2">123 Education Street</p>
                                <p className="text-gray-300 mb-2">New Delhi, 110001</p>
                                <p className="text-gray-300 mb-2">India</p>
                                <p className="text-gray-300 mb-4">contact@eklavyafoundation.org</p>
                                <p className="text-gray-300 mb-6">+91 98765 43210</p>
                                <div className="bg-zinc-800 border border-zinc-700 rounded-lg h-40 flex items-center justify-center">
                                    <span className="text-gray-400">Map Location</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === "login" && (
                    <div className="max-w-md mx-auto">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login">
                                <Card className="bg-zinc-800 border-zinc-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Login to Your Account</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Enter your credentials to access your account.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-300">Email</label>
                                            <Input id="login-email" type="email" placeholder="your.email@example.com" className="bg-zinc-900 border-zinc-700 text-white" />
                                        </div>
                                        <div>
                                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-300">Password</label>
                                            <Input id="login-password" type="password" placeholder="********" className="bg-zinc-900 border-zinc-700 text-white" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center">
                                                <input type="checkbox" className="rounded bg-zinc-900 border-zinc-700 text-blue-600" />
                                                <span className="ml-2 text-sm text-gray-400">Remember me</span>
                                            </label>
                                            <a href="#" className="text-sm text-blue-400 hover:underline">Forgot password?</a>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">Login</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                            <TabsContent value="register">
                                <Card className="bg-zinc-800 border-zinc-700">
                                    <CardHeader>
                                        <CardTitle className="text-white">Create an Account</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Join Eklavya Foundation and be part of our mission.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-300">First Name</label>
                                                <Input id="first-name" placeholder="John" className="bg-zinc-900 border-zinc-700 text-white" />
                                            </div>
                                            <div>
                                                <label htmlFor="last-name" className="block text-sm font-medium text-gray-300">Last Name</label>
                                                <Input id="last-name" placeholder="Doe" className="bg-zinc-900 border-zinc-700 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="register-email" className="block text-sm font-medium text-gray-300">Email</label>
                                            <Input id="register-email" type="email" placeholder="your.email@example.com" className="bg-zinc-900 border-zinc-700 text-white" />
                                        </div>
                                        <div>
                                            <label htmlFor="register-password" className="block text-sm font-medium text-gray-300">Password</label>
                                            <Input id="register-password" type="password" placeholder="********" className="bg-zinc-900 border-zinc-700 text-white" />
                                        </div>
                                        <div>
                                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm Password</label>
                                            <Input id="confirm-password" type="password" placeholder="********" className="bg-zinc-900 border-zinc-700 text-white" />
                                        </div>
                                        <div>
                                            <label className="flex items-center">
                                                <input type="checkbox" className="rounded bg-zinc-900 border-zinc-700 text-blue-600" />
                                                <span className="ml-2 text-sm text-gray-400">I agree to the terms and conditions</span>
                                            </label>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">Register</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-zinc-900 border-t border-zinc-800 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Eklavya Foundation</h3>
                            <p className="text-gray-400">Empowering communities through education since 2001.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><button onClick={() => setActiveTab("about")} className="text-gray-400 hover:text-white">About Us</button></li>
                                <li><button onClick={() => setActiveTab("programs")} className="text-gray-400 hover:text-white">Our Programs</button></li>
                                <li><button onClick={() => setActiveTab("donate")} className="text-gray-400 hover:text-white">Donate</button></li>
                                <li><button onClick={() => setActiveTab("contact")} className="text-gray-400 hover:text-white">Contact</button></li>
                            </ul>
                        </div>
                        {/* <div>
                            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div> */}
                        {/* <div>
                            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                            <p className="text-gray-400 mb-4">Stay updated with our latest news and events.</p>
                            <form className="flex gap-2">
                                <Input placeholder="Your email" className="bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" />
                                <Button>Subscribe</Button>
                            </form>
                        </div> */}
                    </div>
                    <div className="mt-12 border-t border-zinc-800 pt-8">
                        <p className="text-center text-gray-500">&copy; {new Date().getFullYear()} Eklavya Foundation. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}