import { useState, useCallback } from 'react';

/**
 * Custom hook to manage selection of questions by ID.
 * Standardizes selection logic across the application.
 */
export default function useQuestionSelection() {
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelection = useCallback((ids, isSelected) => {
        setSelectedIds(prev => {
            if (!Array.isArray(ids)) ids = [ids];

            if (isSelected) {
                return [...new Set([...prev, ...ids])];
            } else {
                return prev.filter(id => !ids.includes(id));
            }
        });
    }, []);

    const resetSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const isSelected = useCallback((id) => selectedIds.includes(id), [selectedIds]);

    return {
        selectedIds,
        setSelectedIds,
        toggleSelection,
        resetSelection,
        isSelected
    };
}
