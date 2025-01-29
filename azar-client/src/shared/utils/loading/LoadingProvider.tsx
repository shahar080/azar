import React, {createContext, useState} from "react";

interface LoadingContextType {
    isLoading: boolean;
    setLoadingAnimation: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
    isLoading: false,
    setLoadingAnimation: () => {
    },
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isLoadingAnimation, setLoadingAnimation] = useState(false);

    return (
        <LoadingContext.Provider value={{isLoading: isLoadingAnimation, setLoadingAnimation}}>
            {children}
        </LoadingContext.Provider>
    );
};

// Export the context for external use in the hook
export {LoadingContext};
