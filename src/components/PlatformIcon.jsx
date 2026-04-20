import { SiLeetcode, SiCodeforces, SiHackerrank, SiGeeksforgeeks } from 'react-icons/si';

export default function PlatformIcon({ platform }) {
  if (platform === "LeetCode") {
    return <SiLeetcode className="w-6 h-6 text-yellow-600" />;
  } else if (platform === "Codeforces") {
    return <SiCodeforces className="w-6 h-6 text-blue-600" />;
  } else if (platform === "HackerRank") {
    return <SiHackerrank className="w-6 h-6 text-green-600" />;
  } else if (platform === "GeeksForGeeks") {
    return <SiGeeksforgeeks className="w-6 h-6 text-green-800" />;
  }

  let bgColor = "bg-gray-200";
  let textColor = "text-gray-700";
  let letter = "O";

  if (platform === "AtCoder") {
    bgColor = "bg-black";
    textColor = "text-white";
    letter = "A";
  }

  return (
    <div className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${bgColor} ${textColor}`}>
      {letter}
    </div>
  );
}
