import MemberDesignShowcase from "@/components/community/MemberDesignShowcase";

import CustomMaker from "./home/CustomMaker";
import Recommend from "./home/Recommend";
import ScreenVideo from "./home/ScreenVideo";
import Slogan from "./home/Slogan";

export default function Home() {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden bg-white text-neutral-900">
      <ScreenVideo />
      <Recommend />
      <CustomMaker />
      <MemberDesignShowcase className="mt-16 border-t border-neutral-200 pt-16 md:mt-20 md:pt-20" />
      <Slogan />
    </div>
  );
}
