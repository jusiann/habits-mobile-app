const AVATAR_MAPPING = {
  '01': require('../assets/images/avatars/01.png'),
  '02': require('../assets/images/avatars/02.png'),
  '03': require('../assets/images/avatars/03.png'),
  '04': require('../assets/images/avatars/04.png'),
  '05': require('../assets/images/avatars/05.png'),
  '06': require('../assets/images/avatars/06.png'),
  '07': require('../assets/images/avatars/07.png'),
  '08': require('../assets/images/avatars/08.png'),
  '09': require('../assets/images/avatars/09.png')
};

export const getAvatarSource = (profilePictureOrUser, fallbackName = 'Guest') => {
  let profilePicture;
  let userName;

  if (typeof profilePictureOrUser === 'string') {
    profilePicture = profilePictureOrUser;
    userName = fallbackName;
  } else if (profilePictureOrUser && typeof profilePictureOrUser === 'object') {
    profilePicture = profilePictureOrUser.profilePicture;
    userName = profilePictureOrUser.fullname || profilePictureOrUser.username || fallbackName;
  } else {
    profilePicture = null;
    userName = fallbackName;
  }

  if (profilePicture && AVATAR_MAPPING[profilePicture]) {
    return AVATAR_MAPPING[profilePicture];
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=256`;
};

export const getAvailableAvatars = () => {
  return Object.keys(AVATAR_MAPPING).map(id => ({
    id,
    source: AVATAR_MAPPING[id]
  }));
};

export default {
  getAvatarSource,
  getAvailableAvatars
};