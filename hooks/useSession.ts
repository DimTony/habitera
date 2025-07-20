import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { router } from "expo-router";
function useSession() {
    const [loading, setLoading] = useState<boolean>(true);
    const [session, setSession] = useState<any>(null);


    const getSession = async () => {
        const data = await AsyncStorage.getItem('session');
        // console.log('cccc', data)
        if (data) {
            setLoading(false);
            setSession(JSON.parse(data));
            return JSON.parse(data);
        }

        setSession(null);
        router.push('/login');
        return null;
    }

    useEffect(() => {
        getSession()
    }, [])

    return { session, loading }
}



export default useSession;