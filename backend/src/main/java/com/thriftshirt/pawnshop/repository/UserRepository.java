package com.thriftshirt.pawnshop.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.entity.Role;

/**
 * Spring Data JPA repository for User entity.
 * 
 * @author [Your Name]
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Finds a user by username.
     * 
     * @param username the username to search for
     * @return an Optional containing the user if found, or an empty Optional if not found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Finds a user by email.
     * 
     * @param email the email to search for
     * @return an Optional containing the user if found, or an empty Optional if not found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Finds a user by username or email.
     * 
     * @param username the username to search for
     * @param email the email to search for
     * @return an Optional containing the user if found, or an empty Optional if not found
     */
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    /**
     * Checks if a user with the given username exists.
     * 
     * @param username the username to check
     * @return true if a user with the given username exists, false otherwise
     */
    Boolean existsByUsername(String username);
    
    /**
     * Checks if a user with the given email exists.
     * 
     * @param email the email to check
     * @return true if a user with the given email exists, false otherwise
     */
    Boolean existsByEmail(String email);

    /**
     * Counts the number of users with the given role.
     * 
     * @param role the role to count users for
     * @return the number of users with the given role
     */
    long countByRole(Role role);

    /**
     * Counts the number of users created after the given date and time.
     * 
     * @param dateTime the date and time to count users from
     * @return the number of users created after the given date and time
     */
    long countByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Counts the number of users created between the given date and time range.
     * 
     * @param start the start of the date and time range
     * @param end the end of the date and time range
     * @return the number of users created between the given date and time range
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Finds the top 5 most recently created users.
     * 
     * @return a list of the top 5 most recently created users
     */
    List<User> findTop5ByOrderByCreatedAtDesc();
}