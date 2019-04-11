export interface DashboardModel {

    serverInstance : {
        version: string;
        nodeRunning: string; 
    },

    security : {
        sessions : {
            activeCount: string
        },
        oauth2 : {
            activeTokens: string
        }
    }


}