"use client"

import { useState, useEffect } from "react";
import { Checkbox } from "../ui/checkbox";

type ExerciseCheckProps = {
    exerciseId: string;
};

export function ExerciseCheck({ exerciseId }: ExerciseCheckProps) {
    const [isChecked, setIsChecked] = useState(false);

    // Load state from localStorage when component mounts
    useEffect(() => {
        const storedValue = localStorage.getItem(`exercise-${exerciseId}`);
        if (storedValue) {
            setIsChecked(JSON.parse(storedValue));
        }
    }, [exerciseId]);

    // Save state to localStorage whenever it changes
    const handleCheckedChange = (checked: boolean) => {
        setIsChecked(checked);
        localStorage.setItem(`exercise-${exerciseId}`, JSON.stringify(checked));
    };

    return (
        <Checkbox
            id={`check-${exerciseId}`}
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
            className="w-5 h-5"
        />
    )
}
