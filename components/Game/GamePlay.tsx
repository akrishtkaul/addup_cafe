"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MenuList, { MenuItem } from "./MenuList";
import OrderSummary from "./OrderSummary";
import Calculator from "./Calculator";
import WaiterGreeting from "./WaiterGreeting";
import { Coffee } from "lucide-react";
import { restaurantMenus } from "@/lib/restaurantMenus";

type Phase = "greeting" | "menu" | "placed" | "result";

export default function GamePlay() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const classroomId = searchParams.get("classroomId");
    const slot = searchParams.get("slot");
    const restaurantParam = searchParams.get("restaurant");

    const [restaurant, setRestaurant] = useState<string | null>(null);
    const [order, setOrder] = useState<{ [key: string]: number }>({});
    const [phase, setPhase] = useState<Phase>("greeting");
    const [visibleMenuItems, setVisibleMenuItems] = useState(0);
    const [showHelpMessage, setShowHelpMessage] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAssignmentMode, setIsAssignmentMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const menuItems = restaurant && restaurantMenus[restaurant] ? restaurantMenus[restaurant].items : [];

    // Initialize assignment mode or practice mode
    useEffect(() => {
        const init = async () => {
            const user = auth.currentUser;
            
            // Check if signed in
            if (!user) {
                setError("You must be signed in.");
                setLoading(false);
                return;
            }

            // Load user role from Firestore
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserRole(data?.role || "student");
                }
            } catch (err) {
                console.error("Error loading role:", err);
            }

            // Handle assignment mode
            if (mode === "assignment" && classroomId && slot) {
                setIsAssignmentMode(true);
                try {
                    // Fetch assignment doc
                    const assignmentDoc = await getDoc(
                        doc(db, "classrooms", classroomId, "sessions", slot)
                    );
                    
                    if (!assignmentDoc.exists()) {
                        setError("Assignment not found.");
                        setLoading(false);
                        return;
                    }

                    const assignmentData = assignmentDoc.data();
                    if (!assignmentData?.isActive) {
                        setError("This assignment is not active.");
                        setLoading(false);
                        return;
                    }

                    setRestaurant(assignmentData.restaurantKey);

                    // Ensure submission doc exists
                    const submissionRef = doc(
                        db,
                        "classrooms",
                        classroomId,
                        "sessions",
                        slot,
                        "submissions",
                        user.uid
                    );
                    const submissionSnap = await getDoc(submissionRef);

                    if (!submissionSnap.exists()) {
                        // Create submission doc
                        await setDoc(submissionRef, {
                            studentId: user.uid,
                            status: "in_progress",
                            questionsAnswered: 0,
                            correctCount: 0,
                            updatedAt: new Date().toISOString(),
                        });
                        console.log("Created submission doc for assignment");
                    }

                    setLoading(false);
                } catch (err) {
                    console.error("Error initializing assignment:", err);
                    setError("Failed to load assignment.");
                    setLoading(false);
                }
            } else if (restaurantParam) {
                // Practice mode
                setRestaurant(restaurantParam);
                setIsAssignmentMode(false);
                setLoading(false);
            } else {
                // No mode or restaurant specified
                setLoading(false);
            }
        };

        init();
    }, [mode, classroomId, slot, restaurantParam]);

    useEffect(() => {
        if (phase === "menu" && visibleMenuItems < menuItems.length) {
            const t = setTimeout(() => setVisibleMenuItems((v) => v + 1), 350);
            return () => clearTimeout(t);
        }
    }, [visibleMenuItems, phase, menuItems.length]);

    const itemCount = Object.values(order).reduce((a, b) => a + b, 0);

    const addItem = (id: string) => setOrder((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
    const removeItem = (id: string) =>
        setOrder((p) => {
            const copy = { ...p };
            if (!copy[id]) return copy;
            if (copy[id] > 1) copy[id] -= 1;
            else delete copy[id];
            return copy;
        });

    const calculateTotal = () =>
        Object.keys(order).reduce((acc, id) => {
            const item = menuItems.find((m) => m.id === id);
            return acc + (item ? item.price * order[id] : 0);
        }, 0);

    const showMenu = (showAll = false) => {
        setPhase("menu");
        setVisibleMenuItems(showAll ? menuItems.length : 1);
    };

    const placeOrder = () => {
        if (itemCount === 0) return;
        setPhase("placed");
        setUserAnswer("");
        setFeedback(null);
        setShowCalculator(false);
    };

    const checkAnswer = async () => {
        const actual = calculateTotal();
        const parsed = parseFloat(userAnswer);
        if (isNaN(parsed)) { setFeedback("Please enter a valid number (e.g. 35.50)"); return; }
        
        if (Math.abs(parsed - actual) < 0.01) {
            setFeedback("✅ Correct! Great job!");
            setPhase("result");
            setShowCalculator(false);

            // Update submission if in assignment mode
            if (isAssignmentMode && classroomId && slot) {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const submissionRef = doc(
                            db,
                            "classrooms",
                            classroomId,
                            "sessions",
                            slot,
                            "submissions",
                            user.uid
                        );
                        const submissionSnap = await getDoc(submissionRef);
                        if (submissionSnap.exists()) {
                            const current = submissionSnap.data();
                            await setDoc(submissionRef, {
                                studentId: user.uid,
                                status: "submitted",
                                questionsAnswered: (current.questionsAnswered || 0) + 1,
                                correctCount: (current.correctCount || 0) + 1,
                                updatedAt: new Date().toISOString(),
                            });
                        }
                    }
                } catch (err) {
                    console.error("Error updating submission:", err);
                }
            }
        } else {
            setFeedback("❌ Not correct — try again or press Quit to see the answer.");
        }
    };

    const quitAndReveal = async () => {
        const actual = calculateTotal();
        setFeedback(`🔎 The correct total is $${actual.toFixed(2)}`);
        setPhase("result");
        setShowCalculator(false);

        // Update submission if in assignment mode
        if (isAssignmentMode && classroomId && slot) {
            try {
                const user = auth.currentUser;
                if (user) {
                    const submissionRef = doc(
                        db,
                        "classrooms",
                        classroomId,
                        "sessions",
                        slot,
                        "submissions",
                        user.uid
                    );
                    const submissionSnap = await getDoc(submissionRef);
                    if (submissionSnap.exists()) {
                        const current = submissionSnap.data();
                        await setDoc(submissionRef, {
                            studentId: user.uid,
                            status: "submitted",
                            questionsAnswered: (current.questionsAnswered || 0) + 1,
                            correctCount: current.correctCount || 0,
                            updatedAt: new Date().toISOString(),
                        });
                    }
                }
            } catch (err) {
                console.error("Error updating submission:", err);
            }
        }
    };

    const placeAnotherOrder = () => {
        setOrder({});
        setUserAnswer("");
        setFeedback(null);
        setShowCalculator(false);
        setPhase("menu");
        setVisibleMenuItems(1);
    };

    // Show loading state
    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14] flex items-center justify-center">
                <Card className="p-8 text-center rounded-2xl border border-[#E7D6C8] bg-white/80 shadow-sm">
                    <p className="text-lg font-semibold text-[#6B4F3F]">Loading...</p>
                </Card>
            </main>
        );
    }

    // Show error if present
    if (error) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14] flex items-center justify-center">
                <Card className="p-8 text-center rounded-2xl border border-[#E7D6C8] bg-white/80 shadow-sm space-y-4">
                    <h2 className="text-2xl font-bold text-red-600">Error</h2>
                    <p className="text-lg text-[#6B4F3F]">{error}</p>
                    <Button onClick={() => router.push("/game")} className="bg-[#C97C2B] hover:bg-[#B06A23] text-white h-12 px-6 rounded-xl">
                        Back to Restaurants
                    </Button>
                </Card>
            </main>
        );
    }

    // If no restaurant selected yet
    if (!restaurant) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14] flex items-center justify-center">
                <Card className="p-8 text-center rounded-2xl border border-[#E7D6C8] bg-white/80 shadow-sm space-y-4">
                    <h2 className="text-2xl font-bold text-[#2B1B14]">Pick a Restaurant</h2>
                    <p className="text-lg text-[#6B4F3F]">Please select a restaurant to start playing.</p>
                    <Button onClick={() => router.push("/game")} className="bg-[#C97C2B] hover:bg-[#B06A23] text-white h-12 px-6 rounded-xl">
                        Choose Restaurant
                    </Button>
                </Card>
            </main>
        );
    }

    // If invalid restaurant, show error
    if (menuItems.length === 0) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14] flex items-center justify-center">
                <Card className="p-8 text-center rounded-2xl border border-[#E7D6C8] bg-white/80 shadow-sm space-y-4">
                    <h2 className="text-2xl font-bold text-red-600">Restaurant Not Found</h2>
                    <p className="text-lg text-[#6B4F3F]">The restaurant you selected doesn’t exist.</p>
                    <Button onClick={() => router.push("/game")} className="bg-[#C97C2B] hover:bg-[#B06A23] text-white h-12 px-6 rounded-xl">
                        Back to Restaurants
                    </Button>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
            <header className="border-b border-[#E7D6C8] bg-white/70 backdrop-blur sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Coffee className="h-6 w-6 text-[#C97C2B]" />
                        <div className="leading-tight">
                            <span className="text-lg font-semibold text-[#2B1B14] block">Add Up Café</span>
                            <span className="text-sm text-[#6B4F3F]">Order Practice</span>
                        </div>
                    </div>
                    <Link href={isAssignmentMode ? "/student/dashboard" : "/game"}>
                        <Button className="bg-[#C97C2B] hover:bg-[#B06A23] text-white h-11 px-5 rounded-xl">
                            {isAssignmentMode ? "Back to Dashboard" : "Back to Restaurants"}
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-8">
                {phase === "greeting" && <WaiterGreeting onContinue={showMenu} />}

                {(phase === "menu" || phase === "placed" || phase === "result") && (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Column - Menu (only show if phase is 'menu') */}
                        {phase === "menu" && (
                            <div className="lg:col-span-2">
                                <MenuList
                                    menuItems={menuItems}
                                    visibleMenuItems={visibleMenuItems}
                                    order={order}
                                    addItem={addItem}
                                    removeItem={removeItem}
                                />
                                <div className="mt-6">
                                    <p className="text-base text-[#6B4F3F] mb-3">Once you&apos;ve picked quantities, press Place Order.</p>
                                    <Button
                                        onClick={placeOrder}
                                        disabled={itemCount === 0}
                                        className="w-full bg-[#C97C2B] hover:bg-[#B06A23] text-white h-14 text-lg font-semibold rounded-xl disabled:opacity-60"
                                    >
                                        Place Order
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Center/Left Column - Waiter & Order Summary (show after order placed) */}
                        <div className={`flex flex-col gap-6 ${phase === "menu" ? "lg:col-span-1" : "lg:col-span-2"}`}>
                            {/* Waiter Section */}
                            <div className="flex flex-col items-center gap-4">
                                <img src="/waiter.png" alt="Waiter" className="h-40 w-40 object-contain" />
                                <div className="w-full">
                                    <Card className="w-full bg-white border-2 border-[#E7D6C8] p-4 rounded-2xl text-center shadow-sm">
                                        {phase === "menu" && <p className="text-base font-semibold text-[#2B1B14]">Tap + to add items.</p>}
                                        {phase === "placed" && <p className="text-base font-semibold text-[#2B1B14]">Use the calculator and type your total below. No $ needed.</p>}
                                        {phase === "result" && <p className="text-base font-semibold text-[#2B1B14]">Result shown below. Nice work!</p>}
                                    </Card>
                                    {phase === "menu" && (
                                        <Button
                                            onClick={() => setShowHelpMessage((s) => !s)}
                                            className="w-full bg-[#2165D1] hover:bg-[#184fa1] text-white mt-3 h-11 rounded-xl"
                                        >
                                            Help
                                        </Button>
                                    )}
                                    {showHelpMessage && (
                                        <Card className="w-full bg-white border-2 border-[#E7D6C8] p-4 rounded-2xl mt-3 shadow-sm">
                                            <p className="text-base text-[#6B4F3F]">
                                                1: Add items. 2: Press Place Order. 3: Open calculator if needed. 4: Enter total and Check.
                                            </p>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <OrderSummary
                                menuItems={menuItems}
                                order={order}
                                phase={phase}
                                userAnswer={userAnswer}
                                setUserAnswer={setUserAnswer}
                                feedback={feedback}
                                checkAnswer={checkAnswer}
                                quitAndReveal={quitAndReveal}
                                placeAnotherOrder={placeAnotherOrder}
                                itemCount={itemCount}
                            />

                            {/* Edit Order Button (show after order placed) */}
                            {(phase === "placed" || phase === "result") && (
                                <Button
                                    onClick={() => setPhase("menu")}
                                    className="w-full bg-[#6B4F3F] hover:bg-[#584032] text-white h-12 rounded-xl"
                                >
                                    Edit Order
                                </Button>
                            )}
                        </div>

                        {/* Right Column - Calculator (only show when calculator is open) */}
                        {phase === "placed" && showCalculator && (
                            <div className="lg:col-span-1">
                                <Calculator onPasteResult={(v) => setUserAnswer(v)} onClose={() => setShowCalculator(false)} />
                            </div>
                        )}

                        {/* Calculator Toggle Button (show when order placed and calculator hidden) */}
                        {phase === "placed" && !showCalculator && (
                            <div className="lg:col-span-1 flex items-start">
                                <Button
                                    onClick={() => setShowCalculator(true)}
                                    className="w-full bg-[#C97C2B] hover:bg-[#B06A23] text-white h-14 text-lg font-semibold rounded-xl"
                                >
                                    Open Calculator
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}