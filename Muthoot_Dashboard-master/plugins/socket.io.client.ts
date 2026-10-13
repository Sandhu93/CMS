import { io } from 'socket.io-client'


export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const createIO = (token: string) => {
        return io(config.public.socketUrl, {
            autoConnect: false,
            closeOnBeforeunload: true,
            auth: {
                token
            }
        });
    
    }

    return {
        provide: {
            io: createIO
        }
    }
})