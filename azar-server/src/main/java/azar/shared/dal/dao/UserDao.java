package azar.shared.dal.dao;

import java.util.Set;
import azar.cloud.entities.db.Preference;
import static azar.cloud.utils.Constants.DARK_MODE;
import static azar.cloud.utils.Constants.DRAWER_PINNED;
import azar.shared.entities.db.User;
import azar.shared.entities.db.UserType;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
@ApplicationScoped
public class UserDao extends GenericDao<User> {

    @Override
    public void persist(User user) {
        Preference drawerPinned = new Preference();
        drawerPinned.setKey(DRAWER_PINNED);
        drawerPinned.setValue(String.valueOf(true));

        Preference darkMode = new Preference();
        darkMode.setKey(DARK_MODE);
        darkMode.setValue(String.valueOf(false));

        user.setPreferences(Set.of(drawerPinned, darkMode));

        super.persist(user);
    }

    /**
     * A wrapper function to get a user by userName from the db
     *
     * @param userName - the users' name
     *
     * @return the user if found, else, null
     */
    public User getUserByUserName(String userName) {
        return find("userName=?1", userName).firstResult();
    }

    public boolean isAdmin(String userName) {
        User user = getUserByUserName(userName);
        return user.getUserType().equals(UserType.ADMIN);
    }

}
