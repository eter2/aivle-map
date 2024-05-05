const url = 'http://34.64.116.214:8080/api/locations';

exports.getCCTVs = async (left, right) => {
    try {
        const params = {  
            "lowerLeftX": left.getLat(),
            "lowerLeftY": left.getLng(),
            "upperRightX": right.getLat(),
            "upperRightY": right.getLng()
        }
        
        const response = await fetch(`${url}/cctvs?${new URLSearchParams(params)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error during fetch cctvs:', error);
    }
}

exports.getPublicParking = async (left, right) => {
    try {
        const params = {  
            "lowerLeftX": left.getLat(),
            "lowerLeftY": left.getLng(),
            "upperRightX": right.getLat(),
            "upperRightY": right.getLng()
        }
        
        const response = await fetch(`${url}/public-parkings?${new URLSearchParams(params)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error during fetch cctvs:', error);
    }
}