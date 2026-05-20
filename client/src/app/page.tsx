import Bento from "@/components/Bento";
import Hero from "@/components/Hero";
import ScrollCards from "@/components/Scrollcards";
import Footer from "@/components/Footer";



export default function Home() {


  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <ScrollCards />
      <div id="about" className=" py-20">
        <div className="max-w-7xl mx-auto px-18 mb-12 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 ">
            Everything you need to code together
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl">
            From real-time synchronization to host-controlled editing, Live Coding Room provides all the essential features for seamless collaborative development
          </p>
        </div>
        <Bento />
      </div>
      <Footer />
    </div>
  )
}
