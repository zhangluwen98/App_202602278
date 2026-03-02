// 亲密关系系统

// 检查亲密关系更新
export function checkIntimacy(store, choiceId) {
    if (!store.currentNovel) return;
    
    store.currentNovel.characters.forEach(char => {
        const upgradePath = char.intimacy.upgradePath;
        const match = upgradePath.find(u => u.condition && u.condition.type === 'choice' && u.condition.id === choiceId);
        
        if (match) {
            const previousStatus = char.relationships.current;
            const previousIntimacy = char.intimacy.currentStatus;

            // 升级亲密关系状态
            if (!store.intimacy[store.currentNovel.id]) {
                store.intimacy[store.currentNovel.id] = {};
            }
            
            store.intimacy[store.currentNovel.id][char.id] = {
                status: match.status,
                value: match.value || store.intimacy[store.currentNovel.id][char.id]?.value || 0
            };

            // 更新角色的关系状态
            char.relationships.current = match.status;
            char.intimacy.currentStatus = match.status;
            char.intimacy.value = match.value || char.intimacy.value;

            // 如果状态改变，添加到历史记录
            if (previousStatus !== match.status) {
                const historyEntry = {
                    from: previousStatus,
                    to: match.status,
                    description: match.description,
                    type: match.type,
                    timestamp: new Date().toISOString()
                };
                char.relationships.history.unshift(historyEntry);

                // 保存到relationshipHistory用于本地存储
                if (!store.relationshipHistory[store.currentNovel.id]) {
                    store.relationshipHistory[store.currentNovel.id] = {};
                }
                if (!store.relationshipHistory[store.currentNovel.id][char.id]) {
                    store.relationshipHistory[store.currentNovel.id][char.id] = {};
                }
                store.relationshipHistory[store.currentNovel.id][char.id].history = char.relationships.history;
                store.relationshipHistory[store.currentNovel.id][char.id].currentStatus = match.status;
            }

            // 根据结束类型显示不同的提示
            const toastMessage = match.type === 'sweet'
                ? `💕 ${char.name}: ${match.status} - ${match.description}`
                : match.type === 'sad'
                ? `💔 ${char.name}: ${match.status} - ${match.description}`
                : `${char.name}: ${match.status} - ${match.description}`;
            
            store.showToast(toastMessage);
        }
    });
}

// 初始化角色亲密关系
export function initializeIntimacy(store, novelId, characters) {
    if (!store.intimacy[novelId]) {
        store.intimacy[novelId] = {};
    }
    
    characters.forEach(c => {
        // 确保角色对象有必要的属性
        if (!c.relationships) {
            c.relationships = {
                current: c.intimacy?.currentStatus || '初识',
                history: []
            };
        }
        
        if (!store.intimacy[novelId][c.id]) {
            store.intimacy[novelId][c.id] = {
                status: c.intimacy?.currentStatus || '初识',
                value: c.intimacy?.value || 0
            };
        }

        // 从本地存储恢复关系历史
        if (store.relationshipHistory[novelId] && store.relationshipHistory[novelId][c.id]) {
            c.relationships.history = store.relationshipHistory[novelId][c.id].history || [];
            // 同时恢复当前状态（如果已保存）
            if (store.relationshipHistory[novelId][c.id].currentStatus) {
                c.relationships.current = store.relationshipHistory[novelId][c.id].currentStatus;
                c.intimacy.currentStatus = store.relationshipHistory[novelId][c.id].currentStatus;
                store.intimacy[novelId][c.id].status = store.relationshipHistory[novelId][c.id].currentStatus;
            }
        }
    });
}

export default {
    checkIntimacy,
    initializeIntimacy
};