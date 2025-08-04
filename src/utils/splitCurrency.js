const splitCurrency = (input = "", def = "ER") => {
    try {
        const trim = input.trim();
        const enginePattern = /(\d+)([SML])\s*/g;
        let match;
        const result = [];
        
        while ((match = enginePattern.exec(trim)) !== null) {
            const count = parseInt(match[1], 10);
            const engineType = match[2];
            result.push([count, engineType]);
        }
        
        return result.length > 0 ? result : [[NaN, def]];
    } catch (e) {
        return [[NaN, def]];
    }
}

export default splitCurrency;
