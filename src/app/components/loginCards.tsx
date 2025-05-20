"use client";
// import {Card, CardHeader, CardBody, Image} from "@heroui/react";
import { useRouter } from "next/navigation";

interface LoginCardsProps {
    imageSrc: string;
    label: string;
    redirectTO: string;
};

export default function LoginCards({imageSrc, label, redirectTO} : LoginCardsProps) {
    const router = useRouter();

    const handleClick = () => {
        console.log("Redirecting to", redirectTO);
        router.push(redirectTO);
    }

    return (
        <div className="ml-6">
            <div onClick={handleClick} className="py-4 mt-25 cursor-pointer border rounded-xl shadow bg-white max-w-xs mx-auto">
                <div className="pb-0 pt-2 px-4 flex flex-col">
                    <div className="overflow-visible py-2">
                        <img
                            alt="Card background"
                            className="object-cover rounded-xl w-full"
                            src={imageSrc}
                            width={270}
                            height={270}
                        />
                    </div>
                </div>
            </div>
            <p className="text-tiny uppercase font-bold text-center mt-2">{label}</p>
        </div>
    );
}

