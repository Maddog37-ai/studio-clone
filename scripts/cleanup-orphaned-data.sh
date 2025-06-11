#!/bin/bash

echo "🔍 Starting cleanup of orphaned data..."
echo ""

# Function to run Firestore queries and deletions
cleanup_collection() {
    local collection=$1
    local field=$2
    local values=$3
    local description=$4
    
    echo "Checking $description..."
    
    # Use Firebase CLI to query and delete documents
    for value in $values; do
        echo "  Checking for $collection with $field = $value"
        
        # Query for documents (this is a simple check, actual deletion would need more complex handling)
        firebase firestore:query $collection --where "$field==$value" --project=leadflow-4lvrr --format=json > temp_query.json 2>/dev/null
        
        if [ -s temp_query.json ] && [ "$(cat temp_query.json)" != "[]" ]; then
            echo "  Found orphaned documents in $collection"
            # Note: Actual batch deletion would require more complex scripting
            # For now, we'll list what needs to be cleaned up
        fi
        
        rm -f temp_query.json
    done
}

# Check for the specific problematic closer
echo "1. Checking for specific problematic closer (18PJNXfppcxpS2ZwWCstYK8TEQ2)..."
firebase firestore:get /closers/18PJNXfppcxpS2ZwWCstYK8TEQ2 --project=leadflow-4lvrr 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  Found problematic closer - deleting..."
    firebase firestore:delete /closers/18PJNXfppcxpS2ZwWCstYK8TEQ2 --project=leadflow-4lvrr --yes
    echo "  ✅ Problematic closer deleted"
else
    echo "  ✅ Problematic closer does not exist"
fi

echo ""
echo "2. Manual cleanup required for:"
echo "   - closers collection: teamId = 'revolution' or 'takeover-pros'"
echo "   - users collection: teamId = 'revolution' or 'takeover-pros'" 
echo "   - leads collection: teamId = 'revolution' or 'takeover-pros'"
echo "   - activities collection: teamId = 'revolution' or 'takeover-pros'"

echo ""
echo "🎯 Quick fix commands:"
echo ""
echo "# Delete any remaining closers from deleted teams"
echo "firebase firestore:query closers --where 'teamId==revolution' --project=leadflow-4lvrr"
echo "firebase firestore:query closers --where 'teamId==takeover-pros' --project=leadflow-4lvrr"
echo ""
echo "# Check for users that need team reassignment"
echo "firebase firestore:query users --where 'teamId==revolution' --project=leadflow-4lvrr"
echo "firebase firestore:query users --where 'teamId==takeover-pros' --project=leadflow-4lvrr"
echo ""
echo "# Check for leads that need team reassignment"
echo "firebase firestore:query leads --where 'teamId==revolution' --project=leadflow-4lvrr"
echo "firebase firestore:query leads --where 'teamId==takeover-pros' --project=leadflow-4lvrr"

echo ""
echo "✅ Basic cleanup completed!"
