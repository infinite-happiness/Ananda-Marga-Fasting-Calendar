import csv
import json


def csv_to_json(csv_file, json_file):
    data = []
    with open(csv_file, "r") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=";", quotechar='"')
        for row in reader:
            data.append(row)

    with open(json_file, "w") as jsonfile:
        json.dump(data, jsonfile, indent=4)


# Example usage:
csv_filename = "World_Cities_Location_table.csv"
json_filename = "World_Cities_Location_table.json"
csv_to_json(csv_filename, json_filename)
print(f"Converted {csv_filename} to {json_filename}")
