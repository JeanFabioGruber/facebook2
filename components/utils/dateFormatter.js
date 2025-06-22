export function formatDate(timestamp) {
    if (!timestamp || timestamp === 'temporario') return 'Agora mesmo';
    
    try {
        let date;        
        if (timestamp && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } 
        else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        }
        else if (timestamp instanceof Date) {
            date = timestamp;
        }
        else if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        }
        else {
            return 'Agora mesmo';
        }

        if (isNaN(date.getTime())) {
            return 'Agora mesmo';
        }        

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);        
        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins}min atrás`;
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error, timestamp);
        return 'Agora mesmo';
    }
}