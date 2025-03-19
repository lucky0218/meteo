import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

export function useShowToast() {
    const toast = useToast();

    const showToast = useCallback((type, title, description) => {
        toast({
            title,
            description,
            status: type,
            duration: 5000,
            isClosable: true,
            position: "bottom-right",
        });
    }, [toast]);

    return showToast;
}
