import re

def is_comment(line: str) -> bool:
    return line.strip().startswith("#") or not line.strip()


def clean_asset_id(name: str) -> str:
    """
    Converts ANY variant into canonical id:
    - strips folders
    - strips extensions
    - strips # comments accidentally passed in
    - removes -hd
    - normalizes multiple dashes safely
    """

    if not name:
        return ""

    name = name.strip()

    # kill comment lines that leaked in
    if name.startswith("#"):
        name = name.split("#", 1)[1].strip()

    # remove file extensions
    name = re.sub(r"\.(png|webp)$", "", name)

    # remove hd suffix
    name = name.replace("-hd", "")

    # normalize whitespace and dashes
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"-{2,}", "-", name)

    return name.lower()


def extract_key(obj_key: str) -> str:
    """
    Extracts base asset id from R2 key safely
    """
    if not obj_key:
        return ""

    base = obj_key.split("/")[-1]
    return clean_asset_id(base)


def _normalize_for_match(value: str) -> str:
    """
    Normalization layer for legacy inconsistencies.
    ONLY safe transformations.
    """

    value = clean_asset_id(value)

    # SAFE plural normalization:
    # only collapse trailing "s" if it's not a double-s word like "bookshelves"
    if value.endswith("s") and not value.endswith("ss") and not value.endswith("es"):
        value = value[:-1]

    return value


def match_asset(asset_id: str, r2_keys: set) -> tuple[bool, bool]:
    """
    Returns:
    (has_png, has_webp)

    Uses tolerant matching to survive inconsistent naming in R2.
    """

    base = _normalize_for_match(asset_id)

    def matches(key: str) -> bool:
        k = _normalize_for_match(extract_key(key))

        # exact normalized match
        if k == base:
            return True

        # fallback: remove dashes entirely
        if k.replace("-", "") == base.replace("-", ""):
            return True

        return False

    has_png = any(matches(k) for k in r2_keys if k.endswith(".png"))
    has_webp = any(matches(k) for k in r2_keys if k.endswith(".webp"))

    return has_png, has_webp