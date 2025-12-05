package com.thriftshirt.pawnshop.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.entity.TransactionLog;
import com.thriftshirt.pawnshop.repository.TransactionLogRepository;

@Service
@Transactional
public class TransactionLogService {

    @Autowired
    private TransactionLogRepository transactionLogRepository;

    /**
     * Get all transaction logs ordered by timestamp descending
     */
    public List<TransactionLog> getAllLogs() {
        return transactionLogRepository.findAllByOrderByTimestampDesc();
    }

    /**
     * Log a new transaction (helper method for other services)
     */
    public void logTransaction(TransactionLog log) {
        transactionLogRepository.save(log);
    }
}
