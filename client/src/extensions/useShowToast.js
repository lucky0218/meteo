import { useToast } from "@chakra-ui/react";

export function useShowToast() {
    const toast = useToast();
    const showToast = (type, title, description) => {
        toast({
            status: type !== null ? type : "info",
            title: title !== null ? title : "",
            description: description !== null ? description : "",
            duration: 5000,
            isClosable: true,
            position: 'bottom-right'
        });
    };
    return showToast;
}